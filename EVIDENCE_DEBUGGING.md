# Evidence.com API Debugging Guide

## Current Status

✅ **Environment Variables**: Set correctly in `.env.local`
- `EVIDENCE_CLIENT_ID`: ✓ Present
- `EVIDENCE_API_SECRET`: ✓ Present  
- `EVIDENCE_PARTNER_ID`: ✓ Present (`3F68B73F-23C0-43EA-9034-2194F9F7B35B`)

❌ **Authentication**: Getting 401 Unauthorized errors

## What We've Tried

The code now attempts **9 different authentication configurations**:

1. `https://[PARTNER_ID].evidence.com/api/oauth2/token` with `any.read` scope
2. `https://[PARTNER_ID].evidence.com/api/oauth2/token` with `read` scope
3. `https://[PARTNER_ID].evidence.com/api/oauth2/token` with no scope
4. `https://api.evidence.com/oauth2/token` with `any.read` scope
5. `https://api.evidence.com/oauth2/token` with `read` scope
6. `https://evidence.com/api/oauth2/token` with `any.read` scope
7. `https://evidence.com/api/oauth2/token` with `read` scope
8. `https://[PARTNER_ID].evidence.com/oauth/token` with `any.read` scope
9. `https://[PARTNER_ID].evidence.com/api/v2/oauth/token` with `any.read` scope

## Next Steps to Diagnose

### 1. Check Server Logs

When you click "Sync Evidence.com", check your terminal where `npm run dev` is running. You should see detailed logs like:

```
[Evidence.com] Trying auth endpoint: https://3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com/api/oauth2/token with scope: any.read
[Evidence.com] Auth failed: https://...: 401
{
  "error": "...",
  "error_description": "..."
}
```

**Look for the actual error message from Evidence.com** - it will tell us what's wrong.

### 2. Verify API Client Configuration

In Evidence.com Admin Panel:
1. Go to **Admin > Security Settings > API Settings**
2. Find your API client
3. Verify:
   - ✅ Client is **Active** (not disabled)
   - ✅ Has **`any.read`** permission for Evidence (or at least `read`)
   - ✅ **Client ID** matches `EVIDENCE_CLIENT_ID` in `.env.local`
   - ✅ **Client Secret** matches `EVIDENCE_API_SECRET` in `.env.local`
   - ✅ No IP restrictions blocking your localhost
   - ✅ No expiration date that has passed

### 3. Test Authentication Manually

Try testing the authentication directly with curl:

```bash
# Replace with your actual values
CLIENT_ID="your_client_id"
CLIENT_SECRET="your_client_secret"
PARTNER_ID="3F68B73F-23C0-43EA-9034-2194F9F7B35B"

# Test partner-specific endpoint
curl -X POST "https://${PARTNER_ID}.evidence.com/api/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "scope=any.read"
```

**What to look for:**
- If you get a token → Authentication works, issue is elsewhere
- If you get 401 → Check credentials/permissions
- If you get 404 → Wrong endpoint URL
- If you get connection error → Network/firewall issue

### 4. Check Evidence.com API Documentation

Evidence.com might use:
- **Different authentication method** (Basic Auth, API keys, etc.)
- **Different endpoint structure** (e.g., `/api/v2/auth/token` instead of `/oauth2/token`)
- **Different grant type** (e.g., `password` instead of `client_credentials`)
- **Different parameter names** (e.g., `api_key` instead of `client_id`)

### 5. Common Issues

#### Issue: Wrong Partner ID Format
**Symptom**: 404 errors or connection failures
**Solution**: Partner ID might need to be:
- Just the GUID: `3F68B73F-23C0-43EA-9034-2194F9F7B35B`
- With domain: `3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com`
- Different format entirely

#### Issue: Credentials Don't Match
**Symptom**: 401 Unauthorized
**Solution**: 
- Regenerate Client Secret in Evidence.com
- Copy exact values (no extra spaces, quotes, etc.)
- Ensure `.env.local` doesn't have quotes around values

#### Issue: Wrong Permissions
**Symptom**: 401 or 403 errors
**Solution**: API client needs `any.read` or `read` permission for Evidence

#### Issue: API Client Disabled/Expired
**Symptom**: 401 Unauthorized
**Solution**: Check API client status in Evidence.com admin

### 6. Alternative Authentication Methods

If OAuth2 doesn't work, Evidence.com might use:

#### Basic Authentication
```typescript
headers: {
  'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
}
```

#### API Key Authentication
```typescript
headers: {
  'X-API-Key': clientSecret,
  'X-Client-ID': clientId
}
```

#### Different OAuth Flow
- Authorization code flow instead of client credentials
- Different token endpoint
- Different parameter names

## How to Get Help

1. **Check Evidence.com API Documentation**
   - Look for "API Authentication" or "Getting Started" section
   - Check for example code/curl commands

2. **Contact Evidence.com Support**
   - They can verify your API client configuration
   - They can provide correct endpoint URLs
   - They can confirm authentication method

3. **Check Server Logs**
   - The improved code now logs detailed error messages
   - Look for `[Evidence.com]` prefixed messages in terminal

## Testing the Fix

After making changes:

1. **Restart dev server** (if you changed `.env.local`)
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Click "Sync Evidence.com"** button in browser

3. **Check terminal logs** for detailed debugging info

4. **Check browser console** (F12) for frontend errors

5. **Check Network tab** (F12 → Network) to see API request/response

## Expected Success Response

When authentication works, you should see:
```
[Evidence.com] Authentication successful with https://...
[Evidence.com] Token cached, expires in 3600s
[Evidence.com] Successfully fetched from https://...
[Evidence.com] Transformed X videos
```

And videos should appear in the "Evidence.com Videos" section on the dashboard.

