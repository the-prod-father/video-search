# Evidence.com Authentication Diagnosis

## Current Status: INVALID_CLIENT (401)

### Test Results

Tested OAuth2 endpoint: `https://3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com/api/oauth2/token`

**Response:**
```json
{"error":"invalid_client"}
```

**HTTP Status:** 401 Unauthorized

### What This Means

The "invalid_client" error specifically means that Evidence.com **does not recognize** your `client_id` and `client_secret` combination. This is NOT a permissions issue - it's an authentication issue.

### Root Causes (in order of likelihood)

1. **API Client was deleted or regenerated** in Evidence.com admin panel
2. **Client Secret was regenerated** and the .env.local has the old secret
3. **API Client is disabled** in Evidence.com
4. **Wrong Partner ID** format or domain
5. **Incorrect OAuth endpoint** for your Evidence.com deployment

### Immediate Actions Required

#### Step 1: Verify API Client in Evidence.com Admin

1. Log into your Evidence.com account: `https://3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com`
2. Navigate to: **Admin → Security & Integrations → API Settings**
3. Look for the client with ID: `9289D68D-9E4F-4EFA-AA31-99640114234B`
4. Verify:
   - ✅ Client exists
   - ✅ Client is **Active** (not disabled)
   - ✅ **CRITICAL**: For the **Evidence** resource, access must be set to:
     - `any.read` (allows reading all evidence data) OR
     - `read` (basic read access)
   - ⚠️ By default, all operations are **prohibited** - you MUST enable Evidence access!

**Important**: According to Axon documentation, API access is included with most versions but **NOT available in free programs**. If you don't see API Settings, your agency may be on a free tier.

#### Step 2: Regenerate Client Secret

Since Axon never shows the secret again after creation, if you're unsure:

1. In Evidence.com Admin → API Settings
2. Find your client: `9289D68D-9E4F-4EFA-AA31-99640114234B`
3. Click "Regenerate Secret" or "Edit"
4. **Copy the new secret immediately**
5. Update `.env.local`:
   ```bash
   EVIDENCE_API_SECRET="NEW_SECRET_HERE"
   ```
6. Restart the Next.js dev server: `npm run dev`

#### Step 3: Verify Partner ID / Agency Domain

Your current Partner ID: `3F68B73F-23C0-43EA-9034-2194F9F7B35B`

Check if your Evidence.com URL is:
- `https://3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com` ✅
- OR `https://fs.us.evidence.com` (if using US region)
- OR a custom domain

If using a different domain format, update:
```bash
EVIDENCE_PARTNER_ID="your-actual-subdomain-or-guid"
```

#### Step 4: Test Alternative OAuth Endpoints

Evidence.com might use region-specific endpoints:

**US Region:**
```bash
curl -X POST "https://fs.us.evidence.com/api/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_SECRET"
```

**Standard:**
```bash
curl -X POST "https://YOUR_PARTNER_ID.evidence.com/api/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_SECRET"
```

### Alternative Authentication Methods

If OAuth2 client credentials continue failing, Evidence.com might support:

1. **Basic Authentication** (username:password style)
2. **API Key Headers** (X-API-Key)
3. **Different grant types** (authorization_code, refresh_token)

### Next Steps if Still Failing

1. **Contact Axon Support**
   - Provide Client ID: `9289D68D-9E4F-4EFA-AA31-99640114234B`
   - Ask for correct OAuth endpoint URL
   - Verify API access is enabled for your agency

2. **Check Developer Portal**
   - Visit: https://developers.axon.com
   - Sign in with your Axon account
   - Access full API documentation
   - Check for any account-specific API endpoints

3. **Verify License/Permissions**
   - Some Evidence.com deployments require specific license tiers for API access
   - Verify your agency has API access enabled

### Testing Command

After fixing credentials, test with:

```bash
curl -X POST "https://3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com/api/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=9289D68D-9E4F-4EFA-AA31-99640114234B" \
  -d "client_secret=YOUR_NEW_SECRET" \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected successful response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "any.read"
}
```

## Summary

The authentication is failing because Evidence.com doesn't recognize your client credentials. The most likely fix is to **regenerate the Client Secret** in the Evidence.com admin panel and update your `.env.local` file.
