#!/bin/bash

curl -s -X POST https://urfmpapi-production.up.railway.app/api/v1/robots \
  -H "X-API-Key: urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test UR5e Robot",
    "vendor": "universal_robots",
    "model": "UR5e",
    "serialNumber": "UR5E-PROD-001",
    "firmwareVersion": "5.11.0",
    "location": {
      "facility": "Production Line A",
      "cell": "Cell 1"
    },
    "configuration": {
      "maxPayload": 5,
      "reach": 850,
      "joints": 6
    }
  }' | jq
