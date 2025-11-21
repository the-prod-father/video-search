import { NextRequest, NextResponse } from 'next/server';

// Proxy endpoint for HLS video streams and segments
// This adds authentication headers that browsers can't add directly
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Validate that the URL is from TwelveLabs CloudFront
    if (!videoUrl.includes('cloudfront.net') && !videoUrl.includes('twelvelabs')) {
      return NextResponse.json(
        { error: 'Invalid video URL' },
        { status: 400 }
      );
    }

    // Decode the URL
    let decodedUrl = decodeURIComponent(videoUrl);
    
    // If URL ends with /stream/ or /stream, append index.m3u8
    const originalUrl = decodedUrl;
    if (decodedUrl.match(/\/stream\/?$/)) {
      decodedUrl = decodedUrl.replace(/\/stream\/?$/, '/stream/index.m3u8');
      console.log('Appended index.m3u8 to stream URL:', { original: originalUrl, modified: decodedUrl });
    }
    
    console.log('Video proxy request:', {
      originalUrl: videoUrl.substring(0, 100),
      decodedUrl: decodedUrl.substring(0, 150),
      isManifest: decodedUrl.includes('.m3u8') || decodedUrl.includes('/stream/'),
    });

    // Fetch the video stream/manifest
    const apiKey = process.env.TWELVELABS_API_KEY;
    if (!apiKey) {
      console.error('TWELVELABS_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: API key not set' },
        { status: 500 }
      );
    }

    const fetchOptions: RequestInit = {
      headers: {
        'x-api-key': apiKey,
        'Referer': request.headers.get('referer') || '',
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
      },
      redirect: 'follow',
    };

    let response: Response;
    try {
      response = await fetch(decodedUrl, fetchOptions);
    } catch (fetchError: any) {
      console.error('Video proxy fetch exception:', {
        error: fetchError.message,
        url: decodedUrl.substring(0, 150),
        hasApiKey: !!apiKey,
      });
      
      // For HLS manifests, return error manifest instead of JSON
      if (decodedUrl.includes('.m3u8') || decodedUrl.includes('/stream/')) {
        const errorManifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-ERROR:Network Error
# ${fetchError.message}`;
        return new NextResponse(errorManifest, {
          status: 500,
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      return NextResponse.json(
        { 
          error: `Failed to fetch video: ${fetchError.message}`,
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        url: decodedUrl.substring(0, 150),
        error: errorText.substring(0, 500),
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
      };
      console.error('Video proxy fetch error:', errorDetails);
      
      // For HLS manifests, return error in a format HLS.js can understand
      // Don't return JSON - return an error HLS manifest
      if (decodedUrl.includes('.m3u8') || decodedUrl.includes('/stream/')) {
        const errorManifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-ERROR:${response.status} ${response.statusText}
# ${errorText.substring(0, 200)}`;
        return new NextResponse(errorManifest, {
          status: response.status,
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      return NextResponse.json(
        { 
          error: `Failed to fetch video: ${response.statusText}`,
          details: errorText.substring(0, 200),
        },
        { status: response.status }
      );
    }

    // Get the content type - ensure correct MIME type for HLS
    let contentType = response.headers.get('content-type') || '';
    if (decodedUrl.includes('.m3u8') || decodedUrl.includes('/stream/')) {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (decodedUrl.includes('.ts') || decodedUrl.includes('.m4s')) {
      contentType = 'video/mp2t';
    }

    // Handle different content types
    const isManifest = decodedUrl.includes('.m3u8') || decodedUrl.includes('/stream/');
    const isSegment = decodedUrl.includes('.ts') || decodedUrl.includes('.m4s');
    
    // For video segments, return stream directly
    if (isSegment) {
      return new NextResponse(response.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Content-Type',
        },
      });
    }
    
    // For HLS manifests, rewrite segment URLs to use our proxy
    let body: string;
    if (isManifest) {
      // Get manifest as text
      body = await response.text();
      
      try {
        // Rewrite relative segment URLs to use our proxy
        const baseUrl = new URL(decodedUrl);
        const basePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/'));
        const baseOrigin = `${baseUrl.protocol}//${baseUrl.host}${basePath}`;
        
        // Replace segment URLs (lines that don't start with # and end with .ts or .m4s)
        body = body.split('\n').map((line) => {
          const trimmed = line.trim();
          // Skip comments, empty lines, and tags
          if (!trimmed || trimmed.startsWith('#')) {
            return line;
          }
          // If it's a segment URL (.ts or .m4s file)
          if (trimmed.endsWith('.ts') || trimmed.endsWith('.m4s')) {
            if (trimmed.startsWith('http')) {
              // Already absolute, proxy it
              return `/api/video-proxy?url=${encodeURIComponent(trimmed)}`;
            } else {
              // Relative URL, make it absolute then proxy
              const absoluteUrl = `${baseOrigin}/${trimmed}`;
              return `/api/video-proxy?url=${encodeURIComponent(absoluteUrl)}`;
            }
          }
          return line;
        }).join('\n');
      } catch (parseError) {
        console.error('Error parsing HLS manifest:', parseError);
        // Continue with original body if parsing fails
      }
    } else {
      // For other content, get as text
      body = await response.text();
    }

    // Return the content with proper headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Cache-Control', 'public, max-age=3600');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type');
    
    // For HLS manifests, return the rewritten text
    if (decodedUrl.includes('.m3u8') || decodedUrl.includes('/stream/')) {
      return new NextResponse(body, {
        status: 200,
        headers: responseHeaders,
      });
    }
    
    // For video segments, return as stream (shouldn't reach here due to early return above)
    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Video proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to proxy video' },
      { status: 500 }
    );
  }
}

