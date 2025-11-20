#!/bin/bash

# Evidence.com Authentication Test Script
# This script tests various authentication methods against Evidence.com API

echo "========================================"
echo "Evidence.com API Authentication Tester"
echo "========================================"
echo ""

# Load credentials from .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep EVIDENCE | xargs)
else
    echo "❌ .env.local file not found!"
    exit 1
fi

# Remove quotes from variables if present
CLIENT_ID=$(echo $EVIDENCE_CLIENT_ID | tr -d '"')
CLIENT_SECRET=$(echo $EVIDENCE_API_SECRET | tr -d '"')
PARTNER_ID=$(echo $EVIDENCE_PARTNER_ID | tr -d '"')

echo "📋 Current Credentials:"
echo "   Client ID: ${CLIENT_ID:0:8}... (length: ${#CLIENT_ID})"
echo "   Secret: ${CLIENT_SECRET:0:8}... (length: ${#CLIENT_SECRET})"
echo "   Partner ID: $PARTNER_ID"
echo ""

# Test endpoints
declare -a ENDPOINTS=(
    "https://$PARTNER_ID.evidence.com/api/oauth2/token"
    "https://fs.us.evidence.com/api/oauth2/token"
    "https://api.evidence.com/oauth2/token"
    "https://evidence.com/api/oauth2/token"
    "https://$PARTNER_ID.evidence.com/oauth2/token"
)

declare -a SCOPES=(
    "any.read"
    "read"
    ""
    "evidence.read"
    "media.read"
)

echo "🔍 Testing authentication endpoints..."
echo ""

SUCCESS=false

# Try each endpoint
for ENDPOINT in "${ENDPOINTS[@]}"; do
    echo "Testing: $ENDPOINT"

    # Try different scopes
    for SCOPE in "${SCOPES[@]}"; do
        if [ -z "$SCOPE" ]; then
            SCOPE_LABEL="(no scope)"
            SCOPE_PARAM=""
        else
            SCOPE_LABEL="scope=$SCOPE"
            SCOPE_PARAM="&scope=$SCOPE"
        fi

        echo "  ↳ $SCOPE_LABEL"

        # Make the request
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "grant_type=client_credentials&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET$SCOPE_PARAM" \
            2>&1)

        HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
        BODY=$(echo "$RESPONSE" | head -n -1)

        if [ "$HTTP_CODE" = "200" ]; then
            echo "  ✅ SUCCESS! Got 200 response"
            echo "  Response: $BODY"
            echo ""
            echo "========================================"
            echo "✅ AUTHENTICATION SUCCESSFUL!"
            echo "========================================"
            echo ""
            echo "Working endpoint: $ENDPOINT"
            echo "Working scope: $SCOPE_LABEL"
            echo ""

            # Extract token info
            if command -v jq &> /dev/null; then
                echo "Token details:"
                echo "$BODY" | jq '.'
            else
                echo "Response body:"
                echo "$BODY"
            fi

            SUCCESS=true
            break 2
        elif [ "$HTTP_CODE" = "401" ]; then
            ERROR_MSG=$(echo "$BODY" | head -c 100)
            echo "  ❌ 401 Unauthorized: $ERROR_MSG"
        elif [ "$HTTP_CODE" = "404" ]; then
            echo "  ❌ 404 Not Found"
        else
            echo "  ❌ HTTP $HTTP_CODE: $(echo "$BODY" | head -c 100)"
        fi
    done
    echo ""
done

if [ "$SUCCESS" = false ]; then
    echo "========================================"
    echo "❌ ALL AUTHENTICATION ATTEMPTS FAILED"
    echo "========================================"
    echo ""
    echo "Common reasons for failure:"
    echo ""
    echo "1. 🔑 Invalid Credentials"
    echo "   → Go to Evidence.com Admin → API Settings"
    echo "   → Verify client ID: $CLIENT_ID"
    echo "   → Regenerate the client secret"
    echo "   → Update EVIDENCE_API_SECRET in .env.local"
    echo ""
    echo "2. ⚙️  Client Disabled"
    echo "   → Check if the API client is Active in Evidence.com"
    echo ""
    echo "3. 🔒 Missing Permissions"
    echo "   → Verify API client has 'any.read' or 'evidence.read' scope"
    echo ""
    echo "4. 🌍 Wrong Region/Domain"
    echo "   → Verify your Evidence.com URL"
    echo "   → Update EVIDENCE_PARTNER_ID if needed"
    echo ""
    echo "5. 📞 Contact Axon Support"
    echo "   → Provide client ID: $CLIENT_ID"
    echo "   → Ask for correct OAuth endpoint"
    echo ""
    exit 1
fi

echo ""
echo "Next step: Restart your Next.js dev server with 'npm run dev'"
echo ""
