#!/bin/bash

echo "🔍 Checking Stripe Configuration..."
echo ""

# Check if .env.local exists
if [ ! -f "/workspaces/modular-affiliate-system1/apps/web/.env.local" ]; then
    echo "❌ .env.local file not found"
    exit 1
fi

# Source the env file
source /workspaces/modular-affiliate-system1/apps/web/.env.local

# Check required variables
MISSING=0

check_var() {
    local var_name=$1
    local var_value=${!var_name}
    local is_placeholder=$2
    
    if [ -z "$var_value" ]; then
        echo "❌ $var_name: Not set"
        MISSING=1
    elif [[ "$var_value" == *"your_"* ]] || [[ "$var_value" == *"_here"* ]]; then
        echo "⚠️  $var_name: Using placeholder (needs real value)"
        MISSING=1
    else
        # Mask the actual value for security
        local masked="${var_value:0:8}...${var_value: -4}"
        echo "✅ $var_name: $masked"
    fi
}

echo "Environment Variables:"
echo "---------------------"
check_var "STRIPE_SECRET_KEY"
check_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
check_var "STRIPE_WEBHOOK_SECRET"
check_var "STRIPE_STARTER_PRICE_ID"
check_var "STRIPE_PRO_PRICE_ID"
check_var "STRIPE_AGENCY_PRICE_ID"

echo ""
echo "Stripe Packages:"
echo "----------------"
cd /workspaces/modular-affiliate-system1/apps/web
if npm list stripe @stripe/stripe-js 2>/dev/null | grep -q "stripe"; then
    echo "✅ stripe: $(npm list stripe --depth=0 2>/dev/null | grep stripe@ | awk '{print $2}')"
    echo "✅ @stripe/stripe-js: $(npm list @stripe/stripe-js --depth=0 2>/dev/null | grep @stripe/stripe-js@ | awk '{print $2}')"
else
    echo "❌ Stripe packages not installed"
    MISSING=1
fi

echo ""
echo "API Endpoints:"
echo "--------------"
if [ -f "/workspaces/modular-affiliate-system1/apps/web/src/app/api/stripe/webhook/route.ts" ]; then
    echo "✅ Webhook endpoint: /api/stripe/webhook"
else
    echo "❌ Webhook endpoint missing"
    MISSING=1
fi

if [ -f "/workspaces/modular-affiliate-system1/apps/web/src/app/api/stripe/create-checkout-session/route.ts" ]; then
    echo "✅ Checkout endpoint: /api/stripe/create-checkout-session"
else
    echo "❌ Checkout endpoint missing"
    MISSING=1
fi

echo ""
if [ $MISSING -eq 0 ]; then
    echo "✅ Stripe is fully configured!"
    echo ""
    echo "Next steps:"
    echo "1. If using placeholder values, update .env.local with real Stripe keys"
    echo "2. Create products in Stripe Dashboard and add price IDs"
    echo "3. Run: stripe listen --forward-to localhost:3001/api/stripe/webhook"
    echo "4. Start dev server: npm run dev"
else
    echo "⚠️  Stripe configuration incomplete"
    echo ""
    echo "Follow the setup guide in STRIPE_SETUP.md"
fi
