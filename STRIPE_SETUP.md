# Stripe Configuration Guide

## Current Status
✅ Environment variables added to `.env.local` and `.env.example`
✅ Stripe package installed (`stripe` v20.0.0, `@stripe/stripe-js` v8.5.2)
✅ Webhook endpoint created at `/api/stripe/webhook`
✅ Checkout session endpoint ready
⏳ **Needs: Your Stripe API keys**

## Quick Setup Steps

### 1. Get Your Stripe Keys

1. Visit https://dashboard.stripe.com
2. Sign up or log in
3. Navigate to **Developers** → **API keys**
4. Copy your keys (use test mode for development):
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### 2. Create Subscription Products

Navigate to **Products** in Stripe Dashboard and create these three products:

#### Starter Plan
- Name: `Starter`
- Price: `$29.00` USD
- Billing period: `Monthly`
- After creation, copy the **Price ID** (starts with `price_...`)

#### Pro Plan
- Name: `Pro`
- Price: `$79.00` USD
- Billing period: `Monthly`
- Copy the **Price ID**

#### Agency Plan
- Name: `Agency`
- Price: `$199.00` USD
- Billing period: `Monthly`
- Copy the **Price ID**

### 3. Update Environment Variables

Edit `apps/web/.env.local` with your actual Stripe values:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_PRICE_ID
STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID
STRIPE_AGENCY_PRICE_ID=price_YOUR_AGENCY_PRICE_ID
```

### 4. Set Up Webhooks (Local Development)

```bash
# Install Stripe CLI
curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Login and start webhook forwarding
stripe login
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Copy the webhook secret (`whsec_...`) to your `.env.local`

### 5. Restart Dev Server

```bash
cd apps/web
npm run dev
```

## Test the Integration

1. Go to http://localhost:3001/pricing
2. Click any plan's "Get Started"
3. Use test card: `4242 4242 4242 4242`
4. Verify subscription created in database

## API Endpoints

- `POST /api/stripe/create-checkout-session` - Create payment session
- `POST /api/stripe/create-portal-session` - Customer portal
- `POST /api/stripe/webhook` - Webhook handler

## Troubleshooting

**"Stripe not configured"**
- Check `STRIPE_SECRET_KEY` in `.env.local`
- Restart dev server

**Webhook errors**
- Verify `STRIPE_WEBHOOK_SECRET` matches CLI output
- Check webhook endpoint URL

**"Plan not configured"**
- Add all three `STRIPE_*_PRICE_ID` variables
- Ensure they start with `price_` not `prod_`
