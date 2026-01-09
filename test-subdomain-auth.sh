#!/bin/bash

echo "🔧 Testing Subdomain Authentication Fix"
echo "======================================"

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not set"
    echo "Please run: export NEXT_PUBLIC_SUPABASE_URL=your-url"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
    echo "Please run: export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key"
    exit 1
fi

echo "✅ Environment variables configured"

# Check if Node modules are installed
if [ ! -d "apps/web/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd apps/web && npm install
    cd ../..
fi

echo "🏗️ Building the application..."
cd apps/web
npm run build 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    
    echo ""
    echo "🚀 Starting development server..."
    echo "Test URLs:"
    echo "  - Main domain: http://localhost:3000"
    echo "  - Subdomain simulation: Add to /etc/hosts:"
    echo "    127.0.0.1 test.launchpad4success.com"
    echo "    127.0.0.1 demo.launchpad4success.com"
    echo ""
    
    npm run dev
else
    echo "❌ Build failed. Checking for common issues..."
    
    # Check TypeScript errors
    echo "📝 Running TypeScript check..."
    npx tsc --noEmit
    
    echo ""
    echo "🔧 Common fixes:"
    echo "1. Check all imports are correct"
    echo "2. Verify Supabase configuration"
    echo "3. Run 'npm install' to update dependencies"
fi