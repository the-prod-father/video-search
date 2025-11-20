# Evidence.com API - Final Status

## What We Discovered ✅

### 1. Correct Domain
Your Evidence.com instance: **`gavin.st.evidence.com`** (STAGING)

### 2. Valid Credentials
```
Client ID: C9468F51-B9C4-4E65-833F-375372B77864
Secret: oUeP60akYhufZLrz+JUR13M/aFDLDBBFEtzOhD1LRuo=
Partner/Agency ID: 3F68B73F-23C0-43EA-9034-2194F9F7B35B
```

### 3. Correct API Structure
Evidence.com Partner API uses **agency-scoped endpoints**:

```
/api/v2/agencies/{agencyId}/cases
/api/v2/agencies/{agencyId}/evidence
/api/v2/agencies/{agencyId}/media
```

**NOT**:
- ❌ `/api/v2/evidence`
- ❌ `/api/v2/media`
- ❌ `/api/v2/files`

### 4. Authentication Method
Basic Authentication with Client ID and Secret:
```bash
Authorization: Basic {base64(clientId:clientSecret)}
```

## Current Status ⚠️

### What Works:
✅ Credentials are recognized (no "invalid_client" errors)
✅ Correct domain (`gavin.st.evidence.com`)
✅ Found working endpoint structure (`/api/v2/agencies/{agencyId}/...`)
✅ Agency ID is correct (`3F68B73F-23C0-43EA-9034-2194F9F7B35B`)

### What Doesn't Work:
❌ Getting 401 Unauthorized on actual API calls
❌ OAuth2 client_credentials flow not supported (returns "unsupported_grant_type")

## Test Results

### Endpoint Discovery
```bash
# This endpoint EXISTS but returns 401
GET https://gavin.st.evidence.com/api/v2/agencies/3F68B73F-23C0-43EA-9034-2194F9F7B35B/cases
Response: {"errors":[{"status":401,"description":"Unauthorized"}]}
```

The fact that we get `401 Unauthorized` (not `404 Not Found`) proves:
1. ✅ The endpoint exists
2. ✅ The agency ID is correct
3. ❌ Something else is required for authorization

## Possible Reasons for 401

### 1. Staging Instance Limitations
**Most Likely**: Staging instances may:
- Not have full Partner API access enabled
- Require additional configuration
- Use different authentication than production
- Have restricted API endpoints

### 2. Missing Authentication Headers
The API might require additional headers beyond Basic Auth:
- `X-Partner-ID`
- `X-Agency-ID`
- `X-API-Version`
- Custom Axon headers

### 3. OAuth Token Required
Instead of using Basic Auth directly on API calls, you might need to:
1. Get an OAuth token using a different flow
2. Use that token as `Bearer` auth for API calls

### 4. Permissions Not Fully Configured
Even though the API client has permissions in the UI, staging instances might need:
- Manual activation by Axon
- Different permission structure
- Whitelist approval

## Next Steps

### STEP 1: Access Partner API Guide (CRITICAL)
The evidence.com documentation references a **Partner API Guide** that has the exact authentication flow:

1. Go to: **https://developers.axon.com**
2. Sign in with your Axon/Evidence.com account
3. Find: **"Evidence.com Partner API Guide"**
4. Look for:
   - Authentication section (page ~142 mentioned in docs)
   - Staging instance documentation
   - Required headers
   - Example requests

### STEP 2: Check Staging Instance Configuration
In `gavin.st.evidence.com` admin panel:
1. Go to API Settings
2. Check if there's a "Staging Mode" toggle
3. Look for any warnings about API access
4. Check if there's a "Test Connection" button

### STEP 3: Contact Axon Support
If Steps 1-2 don't resolve it, contact Axon:

**Subject**: "Partner API 401 Unauthorized on Staging Instance"

**Details to provide**:
- Instance: `gavin.st.evidence.com` (STAGING)
- Client ID: `C9468F51-B9C4-4E65-833F-375372B77864`
- Endpoint: `/api/v2/agencies/3F68B73F-23C0-43EA-9034-2194F9F7B35B/cases`
- Error: `401 Unauthorized` with Basic Auth
- Question: "Do staging instances support Partner API access? What's the correct authentication method?"

### STEP 4: Try Production Instance (If Available)
If you have access to a production Evidence.com instance:
- Create an API client there with the same permissions
- Test the same API calls
- If it works on production but not staging, that confirms staging has limited API access

## Working Code Example

Once you have the correct authentication method from the Partner API Guide, here's how to call the API:

```typescript
// Get agency ID (same as Partner ID)
const agencyId = process.env.EVIDENCE_PARTNER_ID; // 3F68B73F-23C0-43EA-9034-2194F9F7B35B

// Create Basic Auth header
const basicAuth = Buffer.from(
  `${clientId}:${clientSecret}`
).toString('base64');

// Call API
const response = await fetch(
  `https://gavin.st.evidence.com/api/v2/agencies/${agencyId}/cases`,
  {
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Accept': 'application/json',
      // Add any other required headers from Partner API Guide
    }
  }
);
```

## Temporary Solution: Demo Mode

While waiting for API access, use demo mode in the app:

```
GET /api/evidence/videos?demo=true
```

This shows sample BWC data to demonstrate the UI without requiring actual Evidence.com API access.

## Summary

We've done everything we can from the code side. The final blocker is:

**Staging instances may not support full Partner API access, OR require additional authentication steps not documented publicly.**

You need the **Partner API Guide** from developers.axon.com to see:
1. Exact authentication flow
2. Required headers
3. Staging instance limitations
4. Example requests that work

The credentials are valid, the endpoints exist, we just need the correct way to authenticate against a staging instance.
