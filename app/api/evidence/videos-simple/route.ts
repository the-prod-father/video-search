import { NextRequest, NextResponse } from 'next/server';

// Simple Evidence.com API client using Basic Auth
// Evidence.com staging instances don't support standard OAuth2 client_credentials

export async function GET(request: NextRequest) {
  try {
    // Get credentials
    const clientId = process.env.EVIDENCE_CLIENT_ID?.trim().replace(/"/g, '');
    const clientSecret = process.env.EVIDENCE_API_SECRET?.trim().replace(/"/g, '');
    const partnerId = process.env.EVIDENCE_PARTNER_ID?.trim().replace(/"/g, '');

    if (!clientId || !clientSecret || !partnerId) {
      return NextResponse.json({
        error: 'Missing Evidence.com API credentials',
        missing: {
          clientId: !clientId,
          clientSecret: !clientSecret,
          partnerId: !partnerId,
        },
      }, { status: 400 });
    }

    console.log(`[Evidence.com Simple] Attempting to fetch from: https://${partnerId}.evidence.com`);
    console.log(`[Evidence.com Simple] Client ID: ${clientId.substring(0, 8)}...`);

    // Create Basic Auth header
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const headers = {
      'Authorization': `Basic ${basicAuth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Try different API endpoints
    const baseUrl = `https://${partnerId}.evidence.com`;
    const endpoints = [
      '/api/v2/evidence',
      '/api/v2/media',
      '/api/v2/files',
      '/api/v1/evidence',
      '/api/v1/media',
      '/api/v1/files',
      '/api/evidence',
      '/api/media',
      '/api/files',
    ];

    let lastError = '';

    for (const endpoint of endpoints) {
      const url = `${baseUrl}${endpoint}`;
      console.log(`[Evidence.com Simple] Trying: ${url}`);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        console.log(`[Evidence.com Simple] ${url} - Status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`[Evidence.com Simple] SUCCESS! Got data from ${url}`);
          console.log(`[Evidence.com Simple] Response keys:`, Object.keys(data));

          // Transform to our format
          const videoData = data.items || data.media || data.files || data.data || data.results || data.evidence || [];

          return NextResponse.json({
            success: true,
            endpoint: url,
            data,
            videoCount: Array.isArray(videoData) ? videoData.length : 0,
          });
        } else {
          const errorText = await response.text().catch(() => '');
          lastError = `${url}: ${response.status} - ${errorText.substring(0, 200)}`;
          console.log(`[Evidence.com Simple] Failed: ${lastError}`);
        }
      } catch (err: any) {
        lastError = `${url}: ${err.message}`;
        console.log(`[Evidence.com Simple] Error: ${lastError}`);
      }
    }

    // All endpoints failed
    return NextResponse.json({
      error: 'Could not find working Evidence.com API endpoint',
      lastError,
      baseUrl,
      hint: 'The Evidence.com API endpoints may be different for staging instances. Check the Axon Developer Portal at https://developers.axon.com for correct endpoints.',
    }, { status: 500 });

  } catch (error: any) {
    console.error('[Evidence.com Simple] Error:', error);
    return NextResponse.json({
      error: error.message || 'Unknown error',
    }, { status: 500 });
  }
}
