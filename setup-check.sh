#!/bin/bash

# Modular Affiliate System - Post-Integration Setup Script
# Run this after completing the integration to verify everything works

echo "🚀 Modular Affiliate System - Setup Verification"
echo "=================================================="
echo ""

# Check if .env.local exists
echo "📋 Checking environment configuration..."
if [ -f "apps/web/.env.local" ]; then
    echo "✅ .env.local file found"
else
    echo "❌ .env.local file not found"
    echo "   Please copy apps/web/.env.example to apps/web/.env.local and configure"
    exit 1
fi

# Check for required environment variables
echo ""
echo "🔑 Checking required environment variables..."
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "OPENAI_API_KEY"
)

missing_vars=0
for var in "${required_vars[@]}"; do
    if grep -q "^$var=" apps/web/.env.local 2>/dev/null; then
        value=$(grep "^$var=" apps/web/.env.local | cut -d'=' -f2)
        if [ -n "$value" ] && [ "$value" != "your_"* ]; then
            echo "✅ $var is set"
        else
            echo "⚠️  $var needs to be configured"
            missing_vars=$((missing_vars + 1))
        fi
    else
        echo "❌ $var is missing"
        missing_vars=$((missing_vars + 1))
    fi
done

# Check optional Sendshark configuration
echo ""
echo "📧 Checking Sendshark email integration..."
if grep -q "^SENDSHARK_API_KEY=" apps/web/.env.local 2>/dev/null; then
    value=$(grep "^SENDSHARK_API_KEY=" apps/web/.env.local | cut -d'=' -f2)
    if [ -n "$value" ] && [ "$value" != "your_"* ]; then
        echo "✅ Sendshark is configured"
    else
        echo "⚠️  Sendshark API key needs to be set (optional but recommended)"
    fi
else
    echo "ℹ️  Sendshark not configured (email features will be limited)"
fi

echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules found"
else
    echo "❌ Dependencies not installed"
    echo "   Run: npm install"
    exit 1
fi

echo ""
echo "🗄️  Database Setup Checklist:"
echo "   1. Create a Supabase project at https://supabase.com"
echo "   2. Copy the SQL from infra/supabase-schema.sql"
echo "   3. Run it in the Supabase SQL Editor"
echo "   4. Enable Row Level Security on all tables"
echo ""
echo "   Have you completed these steps? (The app won't work without them)"

echo ""
echo "📚 Next Steps:"
echo "============="
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Visit these pages to test features:"
echo "   • Dashboard:       http://localhost:3000/dashboard"
echo "   • Visual Builder:  http://localhost:3000/visual-builder"
echo "   • AI Generator:    http://localhost:3000/ai-generator"
echo "   • Analytics:       http://localhost:3000/analytics"
echo ""
echo "3. Review documentation:"
echo "   • Integration Summary: INTEGRATION_SUMMARY.md"
echo "   • Full Docs:          docs/INTEGRATION.md"
echo "   • Sendshark Setup:    docs/SENDSHARK.md"
echo ""
echo "4. Configure Sendshark (optional but recommended):"
echo "   • Sign up at https://sendshark.com"
echo "   • Get your API key"
echo "   • Add to SENDSHARK_API_KEY in .env.local"
echo "   • Setup automations: POST /api/email/automation (setup)"
echo ""
echo "5. Deploy to production:"
echo "   • Set up Vercel project"
echo "   • Add environment variables"
echo "   • Run: npm run deploy"
echo ""

if [ $missing_vars -eq 0 ]; then
    echo "✨ Setup looks good! You're ready to start developing."
    echo ""
    echo "Run: npm run dev"
else
    echo "⚠️  Please configure the missing environment variables first."
    echo ""
    echo "Edit: apps/web/.env.local"
fi

echo ""
echo "=================================================="
echo "For questions or issues, check the documentation!"
echo "=================================================="
