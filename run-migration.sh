#!/bin/bash

# Domain Management Migration Script
# This script will guide you through running the database migration

echo "🚀 Launchpad4Success - Domain Management Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 STEP 1: Database Migration${NC}"
echo ""
echo "You need to run the following SQL in your Supabase SQL Editor:"
echo ""
echo -e "${YELLOW}Supabase SQL Editor URL:${NC}"
echo "https://supabase.com/dashboard/project/urwrbjejcozbzgknbuhn/sql/new"
echo ""
echo -e "${YELLOW}Migration File Location:${NC}"
echo "infra/migrations/add_domain_fields.sql"
echo ""
echo -e "${GREEN}Copy this SQL and paste it into the Supabase SQL Editor:${NC}"
echo "-----------------------------------------------------------"
cat infra/migrations/add_domain_fields.sql
echo "-----------------------------------------------------------"
echo ""
read -p "Press Enter after you've run the migration in Supabase..."

echo ""
echo -e "${BLUE}📋 STEP 2: Get Vercel API Credentials${NC}"
echo ""
echo -e "${YELLOW}1. Get VERCEL_API_TOKEN:${NC}"
echo "   → Visit: https://vercel.com/account/tokens"
echo "   → Click 'Create Token'"
echo "   → Name: 'Launchpad4Success Domain Management'"
echo "   → Copy the token"
echo ""
read -p "Enter your VERCEL_API_TOKEN: " VERCEL_API_TOKEN
echo ""

echo -e "${YELLOW}2. Get VERCEL_PROJECT_ID:${NC}"
echo "   → Visit: https://vercel.com/aj9891s-projects/modular-affiliate-system1/settings"
echo "   → Look for 'Project ID' in the General tab"
echo ""
read -p "Enter your VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID
echo ""

echo -e "${YELLOW}3. Get VERCEL_TEAM_ID (Optional - press Enter to skip):${NC}"
echo "   → Visit: https://vercel.com/teams/[team]/settings"
echo "   → Copy the Team ID"
echo ""
read -p "Enter your VERCEL_TEAM_ID (or press Enter to skip): " VERCEL_TEAM_ID
echo ""

echo -e "${BLUE}📋 STEP 3: Adding Environment Variables to Vercel${NC}"
echo ""
echo "Adding VERCEL_API_TOKEN..."
echo "$VERCEL_API_TOKEN" | npx vercel env add VERCEL_API_TOKEN production

echo "Adding VERCEL_PROJECT_ID..."
echo "$VERCEL_PROJECT_ID" | npx vercel env add VERCEL_PROJECT_ID production

if [ ! -z "$VERCEL_TEAM_ID" ]; then
  echo "Adding VERCEL_TEAM_ID..."
  echo "$VERCEL_TEAM_ID" | npx vercel env add VERCEL_TEAM_ID production
fi

echo ""
echo -e "${GREEN}✅ Environment variables added!${NC}"
echo ""

echo -e "${BLUE}📋 STEP 4: Wildcard DNS Configuration${NC}"
echo ""
echo -e "${YELLOW}Manual Step Required:${NC}"
echo "You need to configure DNS for launchpad4success.com"
echo ""
echo "Add this CNAME record in your DNS provider:"
echo "  Type: CNAME"
echo "  Name: *"
echo "  Value: cname.vercel-dns.com"
echo "  TTL: 3600"
echo ""
echo "Then add the domain to Vercel:"
echo "  vercel domains add *.launchpad4success.com"
echo ""
read -p "Press Enter after you've configured DNS..."

echo ""
echo -e "${BLUE}📋 STEP 5: Deploy to Production${NC}"
echo ""
echo "Building and deploying..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "Build successful! Deploying to production..."
  npx vercel --prod --yes
  
  echo ""
  echo -e "${GREEN}🎉 Setup Complete!${NC}"
  echo ""
  echo -e "${YELLOW}Next Steps:${NC}"
  echo "1. Visit your production site"
  echo "2. Login and go to /domains"
  echo "3. Set up a test subdomain"
  echo "4. Verify it works!"
  echo ""
else
  echo ""
  echo -e "${RED}❌ Build failed. Please fix errors and try again.${NC}"
fi
