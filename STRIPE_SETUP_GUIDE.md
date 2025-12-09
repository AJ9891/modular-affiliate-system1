# Stripe Configuration Guide

## ✅ Current Status
- Stripe package installed (`stripe` v20.0.0, `@stripe/stripe-js` v8.5.2)
- API endpoints configured:
  - `/api/stripe/create-checkout-session` - Create subscription checkout
  - `/api/stripe/create-portal-session` - Customer portal access
  - `/api/stripe/webhook` - Webhook event handler
- Environment variables template ready

## 🔧 Setup Instructions

### 1. Get Stripe API Keys

1. Visit [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign up or log in
3. Navigate to **Developers** → **API keys**
4. Copy both keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### 2. Create Subscription Products

Create three subscription products in Stripe Dashboard:

#### Starter Plan ($29/month)
1. Go to **Products** → **Add Product**
2. Product name: `Starter`
3. Description: `1 Active Funnel, Basic Templates, Analytics Dashboard, Email Support`
4. Pricing: **Recurring** → $29/month
5. Click **Save product**
6. **Copy the Price ID** (starts with `price_...`)

#### Pro Plan ($79/month)
1. **Add Product**
2. Product name: `Pro`
3. Description: `Unlimited Funnels, Premium Templates, AI Content Generation, Advanced Analytics`
4. Pricing: **Recurring** → $79/month
5. **Copy the Price ID**

#### Agency Plan ($199/month)
1. **Add Product**
2. Product name: `Agency`
3. Description: `Everything in Pro, White Label Options, Team Collaboration, Dedicated Account Manager`
4. Pricing: **Recurring** → $199/month
5. **Copy the Price ID**

### 3. Configure Webhooks

#### For Local Development:
```bash
# Install Stripe CLI (if not already installed)
# macOS
brew install stripe/stripe-cli/stripe

# Other platforms: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

The CLI will output a webhook signing secret (starts with `whsec_...`). Copy this.

#### For Production:
1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret**

### 4. Update Environment Variables

Edit `/workspaces/modular-affiliate-system1/apps/web/.env.local`:

```dotenv
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_PRICE_ID_HERE
STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID_HERE
STRIPE_AGENCY_PRICE_ID=price_YOUR_AGENCY_PRICE_ID_HERE
```

### 5. Restart Your Development Server

```bash
cd /workspaces/modular-affiliate-system1/apps/web
npm run dev
```

### 6. Test the Integration

1. Visit `http://localhost:3001/pricing`
2. Click on any plan's "Get Started" button
3. You should be redirected to Stripe Checkout
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

## 🔍 Verification Checklist

- [ ] Stripe API keys added to `.env.local`
- [ ] Three products created in Stripe Dashboard
- [ ] Price IDs copied to environment variables
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to environment
- [ ] Development server restarted
- [ ] Test checkout session works
- [ ] Webhook events received (check Stripe CLI output)

## 📝 What Happens After Subscription

When a user subscribes:
1. Stripe Checkout session completes
2. Webhook fires `checkout.session.completed` event
3. User record updated in Supabase with:
   - `subscription_tier` (starter/pro/agency)
   - `subscription_status` (active)
   - `stripe_customer_id`
   - `stripe_subscription_id`
4. Welcome email sent via Sendshark
5. User redirected to dashboard

## 🚨 Common Issues

### "Stripe not configured" error
- Make sure `STRIPE_SECRET_KEY` is set in `.env.local`
- Restart your dev server after adding environment variables

### "Plan not configured" error
- Ensure all three `STRIPE_*_PRICE_ID` variables are set
- Verify the Price IDs match those in your Stripe Dashboard

### Webhook signature verification failed
- Check that `STRIPE_WEBHOOK_SECRET` matches the one from Stripe CLI or Dashboard
- Ensure the endpoint URL is correct
- For local testing, make sure Stripe CLI is running

## 📚 Next Steps

After Stripe is configured:
1. Test a full subscription flow
2. Verify webhook events in Stripe Dashboard
3. Check user subscription data in Supabase
4. Test subscription cancellation/updates via Customer Portal
5. Set up production webhook endpoint when deploying

## 🔗 Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
