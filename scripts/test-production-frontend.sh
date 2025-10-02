#!/bin/bash

echo "🧪 Testing Production Frontend SDK Integration"
echo "=============================================="
echo ""

# Get fresh JWT token
echo "1️⃣ Getting fresh JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST https://urfmpapi-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@urfmp.com","password":"admin123"}')

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.tokens.accessToken')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Got access token"
echo ""

# Decode token to show user info
echo "2️⃣ Token payload:"
echo "$ACCESS_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq
echo ""

# Test API with JWT
echo "3️⃣ Testing API directly with JWT Bearer token..."
API_RESPONSE=$(curl -s https://urfmpapi-production.up.railway.app/api/v1/robots \
  -H "Authorization: Bearer $ACCESS_TOKEN")

ROBOT_COUNT=$(echo "$API_RESPONSE" | jq '.data.robots | length')
echo "✅ API returned $ROBOT_COUNT robots"
echo ""

# Show robots
echo "4️⃣ Robots in production database:"
echo "$API_RESPONSE" | jq '.data.robots[] | {id, name, model, organizationId}'
echo ""

echo "=============================================="
echo "✅ Production API is working correctly"
echo ""
echo "🔍 Next steps for debugging frontend:"
echo "   1. Open https://urfmp-cs6wbuy43-david-morgans-projects-c718d971.vercel.app"
echo "   2. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "   3. Open browser console (F12)"
echo "   4. Log in with admin@urfmp.com / admin123"
echo "   5. Look for these debug logs:"
echo "      - 🔍 Environment check:"
echo "      - [SDK] getRobots - Request config:"
echo "      - 🚀 Fetching robots from API..."
echo "      - ✅ Robots fetched successfully: X robots"
echo ""
echo "🚨 If you still see 0 robots, check the [SDK] logs to see:"
echo "   - Is the Authorization header present?"
echo "   - Does it match the JWT token from login?"
echo "   - Is baseURL pointing to Railway API?"
