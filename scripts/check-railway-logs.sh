#!/bin/bash

echo "Switching to urfmp-api service..."
railway service urfmp-api

echo ""
echo "Fetching recent logs..."
railway logs --tail 100 | grep -E "(Creating robot|Fetching robots|organizationId|error)" | tail -30

echo ""
echo "Done! To see full logs, run: railway logs"
