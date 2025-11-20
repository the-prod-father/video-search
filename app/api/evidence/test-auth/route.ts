import { NextRequest, NextResponse } from 'next/server';

// GET /api/evidence/test-auth - Test authentication and return token info
export async function GET(request: NextRequest) {
  try {
    // Get credentials
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

    if (!clientId || !clientSecret || !partnerId) {
      return NextResponse.json({
        error: 'Missing credentials',
        hasClientId: !!clientId,
        hasSecret: !!clientSecret,
        hasPartnerId: !!partnerId,
      }, { status: 400 });
    }

    const authEndpoint = `https://${partnerId}.evidence.com/api/oauth2/token`;
    
    // Try OAuth2 authentication
    console.log(`[Evidence.com] Testing auth at: ${authEndpoint}`);
    console.log(`[Evidence.com] Client ID: ${clientId.substring(0, 8)}...`);
    
    const tokenResponse = await fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'any.read',
      }),
    });

    const responseText = await tokenResponse.text();
    console.log(`[Evidence.com] Auth response status: ${tokenResponse.status}`);
    console.log(`[Evidence.com] Auth response:`, responseText.substring(0, 500));

    if (tokenResponse.ok) {
      try {
        const tokenData = JSON.parse(responseText);
        return NextResponse.json({
          success: true,
          message: 'Authentication successful',
          hasToken: !!tokenData.access_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in,
          scope: tokenData.scope,
          // Don't return the actual token for security
        });
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: 'Failed to parse token response',
          responseText: responseText.substring(0, 500),
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        status: tokenResponse.status,
        responseText: responseText.substring(0, 500),
        endpoint: authEndpoint,
      }, { status: tokenResponse.status });
    }
  } catch (error: any) {
    console.error('[Evidence.com] Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      details: error.toString(),
    }, { status: 500 });
  }
}

