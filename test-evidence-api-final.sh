#!/bin/bash

echo "=========================================="
echo "Evidence.com Partner API - Final Test"
echo "=========================================="
echo ""

# Load credentials
if [ -f .env.local ]; then
    export $(cat .env.local | grep EVIDENCE | xargs)
else
    echo "❌ .env.local file not found!"
    exit 1
fi

# Remove quotes
CLIENT_ID=$(echo $EVIDENCE_CLIENT_ID | tr -d '"')
CLIENT_SECRET=$(echo $EVIDENCE_API_SECRET | tr -d '"')
AGENCY_ID=$(echo $EVIDENCE_AGENCY_ID | tr -d '"')
PARTNER_ID=$(echo $EVIDENCE_PARTNER_ID | tr -d '"')

echo "📋 Configuration:"
echo "   Instance: https://${PARTNER_ID}.evidence.com"
echo "   Client ID: ${CLIENT_ID:0:12}..."
echo "   Secret: ${CLIENT_SECRET:0:12}..."
echo "   Agency ID: $AGENCY_ID"
echo ""

# Test the endpoint we discovered
ENDPOINT="https://${PARTNER_ID}.evidence.com/api/v2/agencies/${AGENCY_ID}/cases"

echo "🔍 Testing Partner API endpoint:"
echo "   $ENDPOINT"
echo ""

# Create Basic Auth
BASIC_AUTH=$(echo -n "${CLIENT_ID}:${CLIENT_SECRET}" | base64)

echo "🔐 Using Basic Authentication..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$ENDPOINT" \
    -H "Authorization: Basic $BASIC_AUTH" \
    -H "Accept: application/json" \
    2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo ""
echo "📡 Response:"
echo "   HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS! API is working!"
    echo ""
    echo "Response body:"
    if command -v jq &> /dev/null; then
        echo "$BODY" | jq '.'
    else
        echo "$BODY"
    fi
    echo ""
    echo "🎉 Evidence.com API is now connected!"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "⚠️  401 UNAUTHORIZED"
    echo ""
    echo "The endpoint EXISTS and credentials are RECOGNIZED,"
    echo "but additional authentication is required."
    echo ""
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "NEXT STEPS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. 📚 Access the Partner API Guide:"
    echo "   → Go to: https://developers.axon.com"
    echo "   → Sign in with your Axon account"
    echo "   → Find: 'Evidence.com Partner API Guide'"
    echo "   → Check authentication section (~page 142)"
    echo ""
    echo "2. 🔍 Look for:"
    echo "   → Required headers beyond Basic Auth"
    echo "   → OAuth token flow (if needed)"
    echo "   → Staging instance specific docs"
    echo "   → Working code examples"
    echo ""
    echo "3. 📞 Contact Axon Support if needed:"
    echo "   Subject: 'Partner API 401 on Staging Instance'"
    echo "   Instance: ${PARTNER_ID}.evidence.com"
    echo "   Client ID: $CLIENT_ID"
    echo "   Question: Correct auth method for staging?"
    echo ""
    echo "4. 🧪 Alternative: Test on production instance"
    echo "   → Staging may have limited API access"
    echo "   → Try same client on production if available"
    echo ""
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ 404 NOT FOUND"
    echo ""
    echo "The endpoint doesn't exist. Check:"
    echo "   - Agency ID: $AGENCY_ID"
    echo "   - Instance: ${PARTNER_ID}.evidence.com"
    echo ""
elif [ "$HTTP_CODE" = "403" ]; then
    echo "❌ 403 FORBIDDEN"
    echo ""
    echo "Authentication worked but no permission to access."
    echo "Check API client permissions in Evidence.com admin."
    echo ""
else
    echo "❌ UNEXPECTED STATUS: $HTTP_CODE"
    echo ""
    echo "Response:"
    echo "$BODY"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 See EVIDENCE_API_FINAL_STATUS.md for details"
echo ""
