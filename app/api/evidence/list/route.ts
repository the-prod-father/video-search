import { NextRequest, NextResponse } from 'next/server';

// Cache token to avoid repeated auth requests
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getEvidenceToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  let clientId = process.env.EVIDENCE_CLIENT_ID?.trim();
  let clientSecret = process.env.EVIDENCE_API_SECRET?.trim();
  let partnerId = process.env.EVIDENCE_PARTNER_ID?.trim();

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
    return null;
  }

  const oauthConfigs = [
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: 'any.read' },
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: 'read' },
  ];

  for (const config of oauthConfigs) {
    try {
      const tokenResponse = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: config.scope,
        }),
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData.access_token) {
          cachedToken = {
            token: tokenData.access_token,
            expiresAt: Date.now() + ((tokenData.expires_in || 3600) - 300) * 1000,
          };
          return cachedToken.token;
        }
      }
    } catch (e) {
      // Continue to next
    }
  }
  return null;
}

// GET /api/evidence/list - List evidence items
export async function GET(request: NextRequest) {
  try {
    let partnerId = process.env.EVIDENCE_PARTNER_ID?.trim();
    let clientId = process.env.EVIDENCE_CLIENT_ID?.trim();
    let clientSecret = process.env.EVIDENCE_API_SECRET?.trim();
    
    if (partnerId?.startsWith('"') && partnerId?.endsWith('"')) {
      partnerId = partnerId.slice(1, -1);
    }
    if (clientId?.startsWith('"') && clientId?.endsWith('"')) {
      clientId = clientId.slice(1, -1);
    }
    if (clientSecret?.startsWith('"') && clientSecret?.endsWith('"')) {
      clientSecret = clientSecret.slice(1, -1);
    }

    const baseUrl = `https://${partnerId}.evidence.com`;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Note: The /api/v1/media/files endpoint requires evidence_id parameter
    // So we can't list all evidence with this endpoint
    // We'll need to use a different endpoint for listing, or fetch specific evidence IDs
    return NextResponse.json({
      success: false,
      message: 'The /api/v1/media/files endpoint requires an evidence_id parameter. Use /api/evidence/[evidenceId] to fetch specific evidence files.',
      endpoint: '/api/v1/media/files?partner_id={partner_id}&evidence_id={evidence_id}',
      note: 'To list evidence, you may need a different endpoint or provide evidence IDs',
    }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

