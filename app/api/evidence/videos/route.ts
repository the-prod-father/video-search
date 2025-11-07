import { NextRequest, NextResponse } from 'next/server';

// Cache token to avoid repeated auth requests
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getEvidenceToken() {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.EVIDENCE_CLIENT_ID;
  const clientSecret = process.env.EVIDENCE_API_SECRET;
  const partnerId = process.env.EVIDENCE_PARTNER_ID;

  if (!clientId || !clientSecret || !partnerId) {
    throw new Error('Evidence.com API credentials not configured');
  }

  // Try different Evidence.com OAuth endpoints
  const endpoints = [
    'https://api.evidence.com/oauth2/token',
    'https://evidence.com/api/oauth2/token',
    `https://${partnerId}.evidence.com/api/oauth2/token`,
  ];

  let tokenResponse: Response | null = null;
  let lastError = '';

  for (const endpoint of endpoints) {
    try {
      tokenResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'read',
        }),
      });

      if (tokenResponse.ok) {
        break; // Success!
      }
      lastError = `${endpoint}: ${tokenResponse.status}`;
    } catch (err: any) {
      lastError = `${endpoint}: ${err.message}`;
    }
  }

  if (!tokenResponse || !tokenResponse.ok) {
    throw new Error(`Failed to get Evidence.com token from any endpoint. Last error: ${lastError}`);
  }

  const tokenData = await tokenResponse.json();

  // Cache token (expires in 1 hour by default, we'll refresh 5 min early)
  cachedToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + ((tokenData.expires_in || 3600) - 300) * 1000,
  };

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
    const token = await getEvidenceToken();

    // Fetch videos from Evidence.com API
    // Common endpoints: /api/v2/media or /api/v2/files
    const response = await fetch('https://api.evidence.com/api/v2/media', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Try alternative endpoint if first one fails
      const altResponse = await fetch('https://api.evidence.com/api/v2/files', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!altResponse.ok) {
        const errorText = await altResponse.text();
        throw new Error(`Failed to fetch videos: ${altResponse.status} ${errorText}`);
      }

      const data = await altResponse.json();
      return NextResponse.json({
        success: true,
        videos: data.items || data.files || data.data || [],
        source: 'evidence.com',
        endpoint: '/api/v2/files',
      });
    }

    const data = await response.json();

    // Transform Evidence.com video data to our format
    const videos = (data.items || data.media || data.data || []).map((video: any) => ({
      id: video.id || video.file_id,
      title: video.title || video.filename || video.name,
      url: video.url || video.download_url,
      thumbnailUrl: video.thumbnail_url || video.thumbnail,
      duration: video.duration,
      size: video.size,
      uploadDate: video.created_at || video.upload_date,
      category: 'bwc', // Tag as body-worn camera
      metadata: video,
    }));

    return NextResponse.json({
      success: true,
      videos,
      source: 'evidence.com',
      count: videos.length,
    });
  } catch (error: any) {
    console.error('Error fetching Evidence.com videos:', error);

    // Return helpful error with suggestion to use demo mode
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch Evidence.com videos',
        details: error.toString(),
        hint: 'Add ?demo=true to the URL to see demo data, or verify your Evidence.com API credentials and endpoint',
      },
      { status: 500 }
    );
  }
}
