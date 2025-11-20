# Evidence.com API Integration Help

## Current Status

We're getting **404 Not Found** errors on all endpoint variations, which means:
- ✅ Authentication is connecting (we get 404, not 401)
- ❌ The endpoint paths are incorrect

## What We've Tried

### Authentication Methods:
- OAuth2 Client Credentials (getting `invalid_client`)
- Basic Authentication (connects but endpoints return 404)
- API Key Headers

### Endpoints Tried:
- `/api/evidence/{id}`
- `/api/v2/evidence/{id}`
- `/api/v1/evidence/{id}`
- `/api/v2/media/{id}`
- `/api/v2/files/{id}`
- `/api/evidence?id={id}`
- `/api/v2/evidence?evidenceId={id}`
- And many more variations...

### Base URLs:
- `https://3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com`
- `https://api.evidence.com`

## What We Need

To fix this, we need to know:

1. **The correct API endpoint structure**
   - What is the exact URL format for fetching evidence?
   - Is it REST API, GraphQL, or something else?
   - What version of the API are you using?

2. **Working example**
   - If you have a working Postman/curl request, share:
     - Full URL
     - Headers
     - Method
     - Any query parameters

3. **API Documentation**
   - Can you check Evidence.com API docs for:
     - Base URL format
     - Endpoint paths
     - Authentication method
     - Request/response examples

## Quick Test

You can test manually with curl:

```bash
# Test Basic Auth with list endpoint
curl -X GET "https://3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com/api/v2/evidence" \
  -H "Authorization: Basic $(echo -n '9289D68D-9E4F-4EFA-AA31-99640114234B:c1XfbEiEHxtiYBi8MWbsXQG10WBswbins5CBzREhm2Y=' | base64)" \
  -H "Accept: application/json" \
  -v

# Test fetching specific evidence
curl -X GET "https://3F68B73F-23C0-43EA-9034-2194F9F7B35B.evidence.com/api/v2/evidence/A8C1377632F64E1D97235886047E1BE4" \
  -H "Authorization: Basic $(echo -n '9289D68D-9E4F-4EFA-AA31-99640114234B:c1XfbEiEHxtiYBi8MWbsXQG10WBswbins5CBzREhm2Y=' | base64)" \
  -H "Accept: application/json" \
  -v
```

Share what works and we can update the code!

