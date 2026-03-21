04:18:03.614 Error: Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.
04:18:03.615     at instantiateModule (.next/server/chunks/[turbopack]_runtime.js:740:9)
04:18:03.615     at instantiateRuntimeModule (.next/server/chunks/[turbopack]_runtime.js:768:12)
04:18:03.615     at getOrInstantiateRuntimeModule (.next/server/chunks/[turbopack]_runtime.js:781:12)
04:18:03.616     at Object.m (.next/server/chunks/[turbopack]_runtime.js:790:18)
04:18:03.616     at Object.<anonymous> (.next/server/app/api/sales-chat/route.js:8:3)
04:18:04.121 > Build error occurred
04:18:04.124 Error: Failed to collect page data for /api/sales-chat
04:18:04.124     at ignore-listed frames {
04:18:04.124   type: 'Error'
04:18:04.124 }
04:18:04.162 npm error Lifecycle script `build` failed with error:
04:18:04.163 npm error code 1
04:18:04.164 npm error path /vercel/path0/apps/web
04:18:04.164 npm error workspace @modular-affiliate/web@0.1.0
04:18:04.165 npm error location /vercel/path0/apps/web
04:18:04.166 npm error command failed
04:18:04.166 npm error command sh -c next build
04:18:04.183 Error: Command "cd apps/web && npm run build" exited with 1#!/bin/bash

# Vercel Domain Migration Script
# Moves a domain from one project to another or adds it to the main project

set -e

DOMAIN="launchpad4success.pro"
# Update this to the name of your newest Vercel project (e.g., for codex-build-cockpit branch)
TARGET_PROJECT="launchpad4-cockpit"

echo "=================================================="
echo "Vercel Domain Migration Helper"
echo "=================================================="
echo ""
echo "Target domain: $DOMAIN"
echo "Target project: $TARGET_PROJECT"echo ""
echo "IMPORTANT: Make sure TARGET_PROJECT is set to your newest Vercel project name!"
echo "If this is for the codex-build-cockpit branch, find the project name in Vercel dashboard."
echo ""

# Step 1: List current Vercel projects
echo "[STEP 1] Checking your Vercel projects..."
echo "Run this to see all projects:"
echo ""
echo "  vercel projects"
echo ""
echo "Note the project that currently has $DOMAIN and the project name for your newest deployment"
echo ""

# Step 2: List current domains
echo "[STEP 2] Finding current domain ownership..."
echo "Run this to see all domains and which project owns them:"
echo ""
echo "  vercel domains"
echo ""
echo "Find $DOMAIN in the output and note which project it belongs to"
echo ""

# Step 3: Remove domain from old project (if needed)
echo "[STEP 3] If $DOMAIN is on a different project, remove it first:"
echo ""
echo "  vercel remove $DOMAIN"
echo ""
echo "Confirm when prompted"
echo ""

# Step 4: Add domain to newest project
echo "[STEP 4] Add $DOMAIN to the newest project ($TARGET_PROJECT):"
echo ""
echo "  vercel domains add $DOMAIN --project=$TARGET_PROJECT"
echo ""
echo "Follow the prompts to verify DNS"
echo ""

# Step 5: Verify
echo "[STEP 5] Verify the migration:"
echo ""
echo "  vercel domains"
echo ""
echo "Confirm that $DOMAIN now shows under the correct project"
echo ""

echo "=================================================="
echo "Migration complete! Your domain is now on the newest project."
echo "=================================================="
