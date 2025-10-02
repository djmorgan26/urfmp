#!/bin/bash

echo "Logging in to production API..."
response=$(curl -s -X POST https://urfmpapi-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@urfmp.com","password":"admin123"}')

echo ""
echo "Full response:"
echo "$response" | jq

echo ""
echo "Decoded token payload:"
echo "$response" | jq -r '.data.accessToken' | cut -d. -f2 | base64 -d 2>/dev/null | jq
