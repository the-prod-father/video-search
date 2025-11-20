import { NextRequest, NextResponse } from 'next/server';

// Cache token to avoid repeated auth requests
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getEvidenceToken() {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  // Get credentials and strip quotes if present
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
    throw new Error('Evidence.com API credentials not configured');
  }

  // Try OAuth2 authentication
  const oauthConfigs = [
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: 'any.read' },
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: 'read' },
    { endpoint: `https://${partnerId}.evidence.com/api/oauth2/token`, scope: '' },
  ];

  let tokenResponse: Response | null = null;
  let lastError = '';

  for (const config of oauthConfigs) {
    try {
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
        break;
      }
      
      const errorText = await tokenResponse.text().catch(() => '');
      lastError = `${config.endpoint}: ${tokenResponse.status} ${errorText.substring(0, 200)}`;
    } catch (err: any) {
      lastError = `${config.endpoint}: ${err.message}`;
    }
  }

  if (!tokenResponse || !tokenResponse.ok) {
    // Return null to use direct auth
    return null;
  }

  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) {
    return null;
  }

  // Cache token
  cachedToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + ((tokenData.expires_in || 3600) - 300) * 1000,
  };

  return cachedToken.token;
}

// GET /api/evidence/[evidenceId] - Fetch a specific evidence item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { evidenceId: string } }
) {
  const evidenceId = params.evidenceId;

  if (!evidenceId) {
    return NextResponse.json(
      { error: 'Evidence ID is required' },
      { status: 400 }
    );
  }

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

    // Evidence.com might use direct API key auth instead of OAuth2
    // Try multiple authentication methods
    const authMethods = [
      {
        name: 'Basic Auth',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Accept': 'application/json',
        }
      },
      {
        name: 'API Key Headers',
        headers: {
          'X-API-Key': clientSecret,
          'X-Client-ID': clientId,
          'X-Partner-ID': partnerId,
          'Accept': 'application/json',
        }
      },
      {
        name: 'Bearer Token (OAuth2)',
        headers: async () => {
          try {
            const token = await getEvidenceToken();
            if (token) {
              return {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              };
            }
          } catch (e) {
            // OAuth failed
          }
          return null;
        }
      }
    ];
    
    console.log(`[Evidence.com] Fetching evidence ${evidenceId}, will try multiple auth methods`);

    // Use the correct Evidence.com API endpoint format
    // GET /api/v1/media/files?partner_id=<partner_id>&evidence_id=<evidence_id>
    // Try multiple base URLs as per the API proposal document
    const baseUrls = [
      'https://api.evidence.com',
      `https://${partnerId}.evidence.com`,
    ];
    const endpoint = `/api/v1/media/files?partner_id=${partnerId}&evidence_id=${evidenceId}`;

    let lastError = '';

    // Try each base URL and authentication method combination
    for (const baseUrl of baseUrls) {
      const fullUrl = `${baseUrl}${endpoint}`;
      
      for (const authMethod of authMethods) {
        let headers: Record<string, string>;
        
        if (typeof authMethod.headers === 'function') {
          const result = await authMethod.headers();
          if (!result) continue; // Skip if OAuth failed
          headers = result;
        } else {
          headers = authMethod.headers;
        }
        
        console.log(`[Evidence.com] Fetching evidence files from: ${fullUrl} (${authMethod.name})`);
        
        try {
          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: headers,
          });

        if (response.ok) {
          let data;
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            console.log(`[Evidence.com] Non-JSON response from ${fullUrl}:`, text.substring(0, 500));
            throw new Error(`Expected JSON but got ${contentType}`);
          }
          
          console.log(`[Evidence.com] Successfully fetched evidence files for ${evidenceId}`);
          console.log(`[Evidence.com] Response structure:`, JSON.stringify(data).substring(0, 500));
          
          // Transform Evidence.com files response to our format
          // The API returns { files: [...] } where each file has fileId, fileName, etc.
          const files = data.files || [];
          
          if (files.length === 0) {
            return NextResponse.json({
              success: true,
              evidence: null,
              message: 'Evidence found but no files available',
              files: [],
              source: 'evidence.com',
              endpoint: fullUrl,
            });
          }

          // Transform files to video format (use master_copy or first available file)
          const masterFile = files.find((f: any) => f.fileType === 'master_copy') || files[0];
          
          const evidence = {
            id: evidenceId,
            fileId: masterFile.fileId,
            title: masterFile.displayName || masterFile.fileName || 'Untitled Evidence',
            fileName: masterFile.fileName,
            fileType: masterFile.fileType,
            contentType: masterFile.contentType,
            url: masterFile.downloadUrl || masterFile.url, // May need to construct download URL
            thumbnailUrl: null, // Not in API response
            duration: masterFile.duration ? masterFile.duration / 1000000000 : null, // Convert nanoseconds to seconds
            size: masterFile.size,
            recordedOn: masterFile.recordedOn,
            uploadDate: masterFile.recordedOn || masterFile.originalRecordedOn,
            status: masterFile.status,
            category: 'bwc',
            metadata: masterFile,
            allFiles: files, // Include all files
          };

          return NextResponse.json({
            success: true,
            evidence,
            files: files,
            source: 'evidence.com',
            endpoint: fullUrl,
            authMethod: authMethod.name,
          });
        } else {
          const errorText = await response.text().catch(() => '');
          lastError = `${fullUrl}: ${response.status} ${errorText.substring(0, 200)}`;
          
          // Log detailed error info
          if (response.status === 401) {
            console.log(`[Evidence.com] Authentication failed (401) for ${fullUrl}`);
            console.log(`[Evidence.com] Error response:`, errorText.substring(0, 300));
          } else if (response.status === 403) {
            console.log(`[Evidence.com] Permission denied (403) for ${fullUrl}`);
            console.log(`[Evidence.com] Error response:`, errorText.substring(0, 300));
          } else if (response.status === 404) {
            console.log(`[Evidence.com] Evidence not found (404) for ${fullUrl}`);
            console.log(`[Evidence.com] Error response:`, errorText.substring(0, 300));
          } else {
            console.log(`[Evidence.com] Failed (${response.status}) for ${fullUrl}:`, errorText.substring(0, 200));
          }
          // Continue to next auth method
          continue;
        }
      } catch (err: any) {
        lastError = `${fullUrl}: ${err.message}`;
        console.log(`[Evidence.com] Error: ${lastError}`);
        // Continue to next auth method
        continue;
      }
      }
    }

    throw new Error(`Failed to fetch evidence ${evidenceId} from any endpoint. Last error: ${lastError}`);
  } catch (error: any) {
    console.error('[Evidence.com] Error fetching evidence:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch evidence',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

