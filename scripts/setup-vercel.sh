#!/bin/bash

# URFMP Vercel Setup Script
# This script helps you get the required Vercel credentials

echo "🚀 URFMP Vercel Setup"
echo "====================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI found"

# Login to Vercel
echo "🔐 Please login to Vercel..."
vercel login

# Get organization ID
echo ""
echo "📋 Available organizations:"
vercel org ls

echo ""
echo "🔗 Linking project to Vercel..."
vercel link

# Check if .vercel directory was created
if [ -d ".vercel" ] && [ -f ".vercel/project.json" ]; then
    echo ""
    echo "✅ Project linked successfully!"
    echo ""
    echo "📝 Your Vercel credentials:"
    echo "=========================="

    # Extract values from project.json
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId": "[^"]*"' | cut -d'"' -f4)
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId": "[^"]*"' | cut -d'"' -f4)

    echo "VERCEL_ORG_ID=$ORG_ID"
    echo "VERCEL_PROJECT_ID=$PROJECT_ID"

    echo ""
    echo "🔑 To complete setup, you also need a Vercel token:"
    echo "1. Go to https://vercel.com/account/tokens"
    echo "2. Create a new token"
    echo "3. Add these secrets to your GitHub repository:"
    echo ""
    echo "GitHub Secrets to Add:"
    echo "====================="
    echo "VERCEL_TOKEN=your_token_from_step_2"
    echo "VERCEL_ORG_ID=$ORG_ID"
    echo "VERCEL_PROJECT_ID=$PROJECT_ID"

    echo ""
    echo "🌐 To add GitHub secrets:"
    echo "1. Go to https://github.com/djmorgan26/urfmp/settings/secrets/actions"
    echo "2. Click 'New repository secret'"
    echo "3. Add each secret above"

    echo ""
    echo "✨ After adding secrets, your next push will trigger automatic deployment!"

else
    echo "❌ Failed to link project. Please try manually:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Import your GitHub repository"
    echo "3. Check project settings for IDs"
fi

echo ""
echo "📚 For more help, see: ./DEPLOYMENT.md"