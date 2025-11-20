import { NextRequest, NextResponse } from 'next/server';

// Cache token to avoid repeated auth requests
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getEvidenceToken() {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  // Get credentials and strip quotes if present (Next.js includes quotes from .env.local)
  let clientId = process.env.EVIDENCE_CLIENT_ID?.trim();
  let clientSecret = process.env.EVIDENCE_API_SECRET?.trim();
  let partnerId = process.env.EVIDENCE_PARTNER_ID?.trim();

  // Remove surrounding quotes if present
  if (clientId?.startsWith('"') && clientId?.endsWith('"')) {
    clientId = clientId.slice(1, -1);
  }
  if (clientSecret?.startsWith('"') && clientSecret?.endsWith('"')) {
    clientSecret = clientSecret.slice(1, -1);
  }
  if (partnerId?.startsWith('"') && partnerId?.endsWith('"')) {
    partnerId = partnerId.slice(1, -1);
  }

  if (!clientId || !clientSecret || !partnerId) {
    const missing = [];
    if (!clientId) missing.push('EVIDENCE_CLIENT_ID');
    if (!clientSecret) missing.push('EVIDENCE_API_SECRET');
    if (!partnerId) missing.push('EVIDENCE_PARTNER_ID');
    throw new Error(`Evidence.com API credentials not configured. Missing: ${missing.join(', ')}`);
  }

  // Debug logging (without exposing full secrets)
  console.log(`[Evidence.com] Using CLIENT_ID: ${clientId.substring(0, 8)}... (length: ${clientId.length})`);
  console.log(`[Evidence.com] Using SECRET: ${clientSecret.substring(0, 8)}... (length: ${clientSecret.length})`);
  console.log(`[Evidence.com] Using PARTNER_ID: ${partnerId}`);

  // Try different Evidence.com authentication methods
  // Evidence.com might use OAuth2, Basic Auth, or API keys
  
  // Method 1: Try OAuth2 with different scopes and endpoints
  const oauthConfigs = [
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: 'any.read' },
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: 'read' },
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: '' }, // No scope
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: 'evidence.read' },
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: 'media.read' },
    { endpoint: 'https://api.evidence.com/oauth2/token', scope: 'any.read' },
    { endpoint: 'https://api.evidence.com/oauth2/token', scope: 'read' },
  ];

  // Method 2: Try Basic Authentication (some APIs use this)
  const basicAuthToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  let tokenResponse: Response | null = null;
  let lastError = '';
  let successfulEndpoint = '';
  let authMethod = '';

  // First, try OAuth2 client credentials flow
  for (const config of oauthConfigs) {
    try {
      console.log(`[Evidence.com] Trying auth endpoint: ${config.endpoint} with scope: ${config.scope}`);
      
      tokenResponse = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: (() => {
          const params: Record<string, string> = {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          };
          if (config.scope) {
            params.scope = config.scope;
          }
          return new URLSearchParams(params);
        })(),
      });

      if (tokenResponse.ok) {
        successfulEndpoint = config.endpoint;
        console.log(`[Evidence.com] Authentication successful with ${config.endpoint}`);
        break; // Success!
      }
      
      const errorText = await tokenResponse.text().catch(() => '');
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = JSON.stringify(errorJson, null, 2);
      } catch {
        // Not JSON, use as-is
      }
      lastError = `${config.endpoint} (scope: ${config.scope}): ${tokenResponse.status}\n${errorDetails.substring(0, 500)}`;
      console.log(`[Evidence.com] Auth failed: ${lastError}`);
    } catch (err: any) {
      lastError = `${config.endpoint}: ${err.message}`;
      console.log(`[Evidence.com] Auth error: ${lastError}`);
    }
  }

  // If OAuth2 failed, try using credentials directly as API keys
  if (!tokenResponse || !tokenResponse.ok) {
    console.log('[Evidence.com] OAuth2 failed, will try direct API key authentication for video endpoints');
    // Return null to indicate we should try direct auth
    return null;
  }

  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) {
    console.error('[Evidence.com] Token response missing access_token:', tokenData);
    throw new Error('Token response missing access_token field');
  }

  // Cache token (expires in 1 hour by default, we'll refresh 5 min early)
  cachedToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + ((tokenData.expires_in || 3600) - 300) * 1000,
  };

  console.log(`[Evidence.com] Token cached, expires in ${tokenData.expires_in || 3600}s`);
  return cachedToken.token;
}

// GET /api/evidence/videos - Fetch videos from Evidence.com
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const demoMode = searchParams.get('demo') === 'true';

  // Demo mode for showcase purposes
  if (demoMode) {
    return NextResponse.json({
      success: true,
      demo: true,
      videos: [
        {
          id: 'demo-001',
          title: 'Officer Patrol - Downtown District',
          url: 'https://example.com/video1.mp4',
          thumbnailUrl: null,
          duration: 1847, // ~30 min
          size: 524288000,
          uploadDate: new Date().toISOString(),
          category: 'bwc',
          metadata: { type: 'body-worn-camera', officer: 'J. Smith', incident: 'Routine Patrol' }
        },
        {
          id: 'demo-002',
          title: 'Traffic Stop - Highway 101',
          url: 'https://example.com/video2.mp4',
          thumbnailUrl: null,
          duration: 623, // ~10 min
          size: 178257920,
          uploadDate: new Date(Date.now() - 86400000).toISOString(),
          category: 'bwc',
          metadata: { type: 'body-worn-camera', officer: 'M. Johnson', incident: 'Traffic Stop' }
        },
        {
          id: 'demo-003',
          title: 'Incident Response - Main St',
          url: 'https://example.com/video3.mp4',
          thumbnailUrl: null,
          duration: 2156, // ~35 min
          size: 617086976,
          uploadDate: new Date(Date.now() - 172800000).toISOString(),
          category: 'bwc',
          metadata: { type: 'body-worn-camera', officer: 'R. Davis', incident: 'Incident Response' }
        }
      ],
      source: 'evidence.com (demo)',
      count: 3,
    });
  }

  try {
    // Get credentials (strip quotes if present)
    let partnerId = process.env.EVIDENCE_PARTNER_ID?.trim();
    let clientId = process.env.EVIDENCE_CLIENT_ID?.trim();
    let clientSecret = process.env.EVIDENCE_API_SECRET?.trim();
    
    // Remove surrounding quotes if present
    if (partnerId?.startsWith('"') && partnerId?.endsWith('"')) {
      partnerId = partnerId.slice(1, -1);
    }
    if (clientId?.startsWith('"') && clientId?.endsWith('"')) {
      clientId = clientId.slice(1, -1);
    }
    if (clientSecret?.startsWith('"') && clientSecret?.endsWith('"')) {
      clientSecret = clientSecret.slice(1, -1);
    }

    // Try to get OAuth token, but if it fails, we'll use direct auth
    const token = await getEvidenceToken();
    const useDirectAuth = token === null;
    
    // Prepare auth headers
    let authHeaders: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (useDirectAuth) {
      // Use credentials directly as API keys (common for Evidence.com)
      console.log('[Evidence.com] Using direct API key authentication');
      // Try multiple auth header combinations
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      authHeaders['Authorization'] = `Basic ${basicAuth}`;
      authHeaders['X-API-Key'] = clientSecret || '';
      authHeaders['X-Client-ID'] = clientId || '';
      authHeaders['X-Partner-ID'] = partnerId || '';
    } else {
      authHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Try multiple base URLs and endpoints
    const baseUrls = [
      'https://api.evidence.com',
      `https://${partnerId}.evidence.com`,
      `https://${partnerId}`,
    ];

    const endpoints = [
      '/api/v2/media',
      '/api/v2/files',
      '/api/v2/evidence',
      '/api/v1/media',
      '/api/v1/files',
      '/api/v2/media/files',
      '/api/v2/evidence/files',
      '/api/media',
      '/api/files',
      '/api/evidence',
      '/api/v2/videos',
      '/api/videos',
    ];

    let lastError = '';
    let successfulUrl = '';
    let successfulEndpoint = '';
    let lastResponseStatus = 0;
    let lastResponseText = '';

    // Try all combinations
    for (const baseUrl of baseUrls) {
      for (const endpoint of endpoints) {
        const fullUrl = `${baseUrl}${endpoint}`;
        try {
          console.log(`[Evidence.com] Trying video endpoint: ${fullUrl}`);
          
          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: authHeaders,
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`[Evidence.com] Successfully fetched from ${fullUrl}, response keys:`, Object.keys(data));
            
            // Check if response has video data
            const videoData = data.items || data.media || data.files || data.data || data.results || [];
            
            if (Array.isArray(videoData) && videoData.length >= 0) {
              successfulUrl = baseUrl;
              successfulEndpoint = endpoint;
              
              // Transform Evidence.com video data to our format
              const videos = videoData.map((video: any) => ({
                id: video.id || video.file_id || video.media_id || video.evidence_id,
                title: video.title || video.filename || video.name || video.description || 'Untitled Video',
                url: video.url || video.download_url || video.media_url || video.file_url,
                thumbnailUrl: video.thumbnail_url || video.thumbnail || video.preview_url,
                duration: video.duration || video.length || video.duration_seconds,
                size: video.size || video.file_size || video.size_bytes,
                uploadDate: video.created_at || video.upload_date || video.date_created || video.created,
                category: 'bwc', // Tag as body-worn camera
                metadata: video,
              }));

              console.log(`[Evidence.com] Transformed ${videos.length} videos`);
              
              return NextResponse.json({
                success: true,
                videos,
                source: 'evidence.com',
                count: videos.length,
                endpoint: `${successfulUrl}${successfulEndpoint}`,
              });
            }
          } else {
            const errorText = await response.text().catch(() => '');
            lastError = `${fullUrl}: ${response.status} ${errorText.substring(0, 200)}`;
            lastResponseStatus = response.status;
            lastResponseText = errorText.substring(0, 500);
            console.log(`[Evidence.com] Endpoint failed (${response.status}): ${lastError}`);
            
            // If we get 401/403, try different auth header combinations
            if ((response.status === 401 || response.status === 403) && useDirectAuth) {
              console.log(`[Evidence.com] Trying alternative auth headers for ${fullUrl}`);
              
              // Try with just Basic Auth
              const altResponse1 = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                  'Accept': 'application/json',
                },
              });
              
              if (altResponse1.ok) {
                const data = await altResponse1.json();
                const videoData = data.items || data.media || data.files || data.data || data.results || [];
                if (Array.isArray(videoData)) {
                  successfulUrl = baseUrl;
                  successfulEndpoint = endpoint;
                  const videos = videoData.map((video: any) => ({
                    id: video.id || video.file_id || video.media_id || video.evidence_id,
                    title: video.title || video.filename || video.name || video.description || 'Untitled Video',
                    url: video.url || video.download_url || video.media_url || video.file_url,
                    thumbnailUrl: video.thumbnail_url || video.thumbnail || video.preview_url,
                    duration: video.duration || video.length || video.duration_seconds,
                    size: video.size || video.file_size || video.size_bytes,
                    uploadDate: video.created_at || video.upload_date || video.date_created || video.created,
                    category: 'bwc',
                    metadata: video,
                  }));
                  return NextResponse.json({
                    success: true,
                    videos,
                    source: 'evidence.com',
                    count: videos.length,
                    endpoint: `${successfulUrl}${successfulEndpoint}`,
                    authMethod: 'Basic Auth',
                  });
                }
              }
              
              // Try with API key headers only
              const altResponse2 = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                  'X-API-Key': clientSecret || '',
                  'X-Client-ID': clientId || '',
                  'Accept': 'application/json',
                },
              });
              
              if (altResponse2.ok) {
                const data = await altResponse2.json();
                const videoData = data.items || data.media || data.files || data.data || data.results || [];
                if (Array.isArray(videoData)) {
                  successfulUrl = baseUrl;
                  successfulEndpoint = endpoint;
                  const videos = videoData.map((video: any) => ({
                    id: video.id || video.file_id || video.media_id || video.evidence_id,
                    title: video.title || video.filename || video.name || video.description || 'Untitled Video',
                    url: video.url || video.download_url || video.media_url || video.file_url,
                    thumbnailUrl: video.thumbnail_url || video.thumbnail || video.preview_url,
                    duration: video.duration || video.length || video.duration_seconds,
                    size: video.size || video.file_size || video.size_bytes,
                    uploadDate: video.created_at || video.upload_date || video.date_created || video.created,
                    category: 'bwc',
                    metadata: video,
                  }));
                  return NextResponse.json({
                    success: true,
                    videos,
                    source: 'evidence.com',
                    count: videos.length,
                    endpoint: `${successfulUrl}${successfulEndpoint}`,
                    authMethod: 'API Key Headers',
                  });
                }
              }
            }
          }
        } catch (err: any) {
          lastError = `${fullUrl}: ${err.message}`;
          console.log(`[Evidence.com] Endpoint error: ${lastError}`);
        }
      }
    }

    // If we got here, all endpoints failed
    throw new Error(`Failed to fetch videos from any endpoint. Last error: ${lastError}`);
  } catch (error: any) {
    console.error('[Evidence.com] Error fetching videos:', error);

    // Return helpful error with debugging info
    const errorResponse: any = {
      error: error.message || 'Failed to fetch Evidence.com videos',
      details: error.toString(),
      hint: 'Verify your Evidence.com API credentials and endpoints. Check server logs for detailed error messages.',
    };

    // Add environment check info (without exposing secrets)
    const hasClientId = !!process.env.EVIDENCE_CLIENT_ID;
    const hasSecret = !!process.env.EVIDENCE_API_SECRET;
    const hasPartnerId = !!process.env.EVIDENCE_PARTNER_ID;
    
    errorResponse.config = {
      hasClientId,
      hasSecret,
      hasPartnerId,
      partnerId: hasPartnerId ? process.env.EVIDENCE_PARTNER_ID : 'not set',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
