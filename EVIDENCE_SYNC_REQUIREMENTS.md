# Evidence.com Sync Requirements

## Overview
This document outlines what's needed to sync Axon Evidence.com videos to the frontend application.

## Current Status
The sync button calls `/api/evidence/videos` which attempts to authenticate with Evidence.com and fetch videos. Currently getting **401 Unauthorized** errors, indicating authentication issues.

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Evidence.com API Credentials
EVIDENCE_CLIENT_ID=your_client_id_here
EVIDENCE_API_SECRET=your_client_secret_here
EVIDENCE_PARTNER_ID=your_partner_id_here
```

### How to Get These Credentials

1. **Log into Axon Evidence.com**
   - Navigate to your Evidence.com account
   - Go to **Admin > Security Settings > API Settings**

2. **Create or Review API Client**
   - Click "Create Client" if you don't have one
   - Give it a descriptive name (e.g., "Video Search Integration")
   - **CRITICAL - Set Resource Permissions:**

     ⚠️ **BY DEFAULT, ALL OPERATIONS ARE PROHIBITED!** You MUST enable access:

     - **Evidence**: Set to `any.read` (allows reading all evidence data)
       - This is REQUIRED for video sync to work
       - Without this, you'll get 401/403 errors even with valid credentials
     - **Users** (optional): Set to `read` (allows reading user information)
     - All other resources: Can remain prohibited unless needed

   - Click **Save**
   - **IMMEDIATELY copy** the **Client Secret** - Evidence.com will NEVER show it again!
   - Also copy the **Client ID** and **Partner ID**

   ⚠️ **Important**: API access is NOT available in free Evidence.com programs. If you don't see "API Settings" in your admin panel, contact Axon to upgrade your license.

3. **Partner ID**
   - The Partner ID is typically your Evidence.com subdomain identifier
   - Format: Usually a GUID like `3F68B73F-23C0-43EA-9034-2194F9F7B35B`
   - Can be found in your Evidence.com URL: `https://[PARTNER_ID].evidence.com`
   - Or check your API settings page

## API Endpoints Being Tried

The code currently attempts these authentication endpoints (in order):
1. `https://api.evidence.com/oauth2/token`
2. `https://evidence.com/api/oauth2/token`
3. `https://[PARTNER_ID].evidence.com/api/oauth2/token`

After authentication, it tries these video endpoints:
1. `https://api.evidence.com/api/v2/media`
2. `https://api.evidence.com/api/v2/files` (fallback)

## Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Symptoms:** Console shows "Failed to get Evidence.com token from any endpoint. Last error: 401"

**Solutions:**
- Verify `EVIDENCE_CLIENT_ID` and `EVIDENCE_API_SECRET` are correct
- Check that the API client has `any.read` permission for Evidence
- Ensure credentials haven't expired or been regenerated
- Try regenerating the Client Secret in Evidence.com admin panel

### Issue 2: Wrong Partner ID Format
**Symptoms:** Authentication fails with partner-specific endpoint

**Solutions:**
- Verify `EVIDENCE_PARTNER_ID` matches your Evidence.com subdomain
- Check if it needs to be just the GUID or include `.evidence.com`
- Try both formats: `3F68B73F-23C0-43EA-9034-2194F9F7B35B` and `3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com`

### Issue 3: Wrong API Endpoints
**Symptoms:** Authentication succeeds but video fetch returns 404 or empty results

**Solutions:**
- Evidence.com API might use different endpoints
- Check Evidence.com API documentation for correct endpoints
- Common alternatives:
  - `/api/v1/media`
  - `/api/v2/evidence`
  - `/api/v2/files`
  - `/api/v2/media/files`

### Issue 4: Missing Scope Permissions
**Symptoms:** Token obtained but API returns 403 Forbidden

**Solutions:**
- Verify API client has `any.read` scope for Evidence
- Check if additional scopes are needed (e.g., `media.read`, `files.read`)

## Testing the Integration

### Step 1: Verify Environment Variables
```bash
# Check if variables are loaded (in Next.js, restart dev server after adding .env.local)
echo $EVIDENCE_CLIENT_ID  # Should show your client ID
```

### Step 2: Test Authentication Manually
You can test the OAuth flow using curl:

```bash
curl -X POST https://api.evidence.com/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=read"
```

### Step 3: Test Video Fetch
Once you have a token:

```bash
curl -X GET https://api.evidence.com/api/v2/media \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

## Debugging Tips

1. **Check Server Logs**
   - Look at terminal output where `npm run dev` is running
   - Errors will be logged there

2. **Browser Console**
   - Open browser DevTools (F12)
   - Check Console tab for error messages
   - Check Network tab to see API request/response details

3. **Enable Demo Mode**
   - Add `?demo=true` to the API call to test frontend display
   - This bypasses authentication and shows sample data

4. **Verify API Client Status**
   - In Evidence.com admin, verify the API client is active
   - Check if there are any IP restrictions or rate limits

## Next Steps

1. ✅ Set up `.env.local` with correct credentials
2. ✅ Verify API client permissions in Evidence.com
3. ✅ Test authentication endpoint manually
4. ✅ Check Evidence.com API documentation for correct endpoints
5. ✅ Update API route if endpoints differ from current implementation
6. ✅ Test video fetch and verify response format matches expected structure

## Additional Resources

- [Axon Evidence.com API Settings Documentation](https://www.axon.com/help/developer/software/developer/api-settings.htm)
- Evidence.com API documentation (check your Evidence.com admin panel)
- Contact Axon support if you need help with API access

## Current Implementation Details

The sync flow:
1. User clicks "Sync Evidence.com" button
2. Frontend calls `GET /api/evidence/videos`
3. Backend attempts OAuth authentication
4. Backend fetches videos from Evidence.com API
5. Backend transforms data to match frontend format
6. Frontend displays videos in "Evidence.com Videos" section

If authentication fails, the frontend automatically falls back to demo mode (shows sample data).

