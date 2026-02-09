# Affiliate Link Tracking System

## Overview

Complete affiliate link tracking and analytics system with click tracking, conversion attribution, and UTM parameter support.

## Features

### 1. Click Tracking

- Automatic click logging with metadata
- UTM parameter capture (source, medium, campaign, content, term)
- 30-day attribution cookies
- Unique click IDs for precise tracking

### 2. Conversion Attribution

- Cookie-based attribution (30-day window)
- Revenue tracking per conversion
- Order ID tracking for deduplication
- Automatic attribution to original click

### 3. Analytics Dashboard

- Real-time click and conversion metrics
- Conversion rate calculation
- Total revenue tracking
- Clicks by source breakdown
- Clicks by offer breakdown
- Recent activity feed
- Time range filters (7d, 30d, all time)

### 4. Redirect System

- Tracked affiliate link redirects
- Preserves UTM parameters
- Sets attribution cookies automatically
- Database logging for all clicks

## How It Works

### Basic Flow

1. User clicks affiliate link on your funnel page
2. Click is tracked in database with all UTM parameters
3. Attribution cookie is set (30-day expiry)
4. User is redirected to affiliate offer
5. When user converts, conversion is linked to original click via cookie
6. Analytics are updated in real-time

### URL Structure

#### Tracking Links

```
https://yourdomain.com/api/redirect/[offer-id]?utm_source=facebook&utm_medium=cpc&utm_campaign=summer-sale
```

#### Direct API Tracking

```
POST /api/track/click
{
  "offer_id": "uuid",
  "funnel_id": "uuid",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "summer-sale"
}
```

#### Conversion Tracking

```
POST /api/track/conversion
{
  "offer_id": "uuid",
  "amount": 99.99,
  "order_id": "order_12345"
}
```

## Implementation Guide

### Step 1: Add an Offer

1. Navigate to `/offers`
2. Click "Add Offer"
3. Fill in offer details:
   - Name
   - Description
   - Affiliate Link
   - Commission Rate
4. Save offer

### Step 2: Get Tracking Link

1. Copy the tracking link from the offer page
2. Format: `/api/redirect/[offer-id]`
3. Add UTM parameters as needed

### Step 3: Use in Your Funnel

```tsx
import { trackClick, extractUTMParams } from '@/lib/tracking'

async function handleClick(offerId: string) {
  const utm = extractUTMParams()
  
  await trackClick({
    offerId,
    funnelId: 'your-funnel-id',
    ...utm
  })
  
  window.location.href = `/api/redirect/${offerId}?utm_source=${utm.utmSource}`
}
```

### Step 4: Track Conversions

Server-side (on your thank-you page):

```tsx
await fetch('/api/track/conversion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    offer_id: 'uuid',
    amount: 99.99,
    order_id: 'unique-order-id'
  })
})
```

Or use conversion pixel (embedded on merchant's thank-you page):

```html
<img src="https://yourdomain.com/api/track/conversion?offer_id=uuid&amount=99.99&order_id=123" width="1" height="1" style="display:none" />
```

## Utility Functions

### trackClick(params)

Tracks an affiliate link click

```tsx
trackClick({
  offerId: string,
  funnelId?: string,
  utmSource?: string,
  utmMedium?: string,
  utmCampaign?: string
})
```

### trackConversion(params)

Tracks a conversion event

```tsx
trackConversion({
  offerId: string,
  amount: number,
  orderId: string
})
```

### extractUTMParams()

Extracts UTM parameters from current URL

```tsx
const { utmSource, utmMedium, utmCampaign } = extractUTMParams()
```

### buildAffiliateLink(baseUrl, offerId, options)

Builds tracking-enabled affiliate link

```tsx
const link = buildAffiliateLink(
  'https://example.com/product',
  'offer-uuid',
  {
    source: 'facebook',
    medium: 'cpc',
    campaign: 'summer-sale'
  }
)
```

## Database Schema

### clicks table

```sql
- click_id: uuid (primary key)
- offer_id: uuid (foreign key)
- funnel_id: uuid (foreign key, optional)
- utm_source: text
- utm_medium: text
- utm_campaign: text
- clicked_at: timestamp
```

### conversions table

```sql
- conversion_id: uuid (primary key)
- click_id: uuid (foreign key, links to original click)
- offer_id: uuid (foreign key)
- amount: decimal
- order_id: text
- converted_at: timestamp
```

## API Routes

### GET /api/redirect/[id]

Redirects to affiliate link and tracks click

### POST /api/track/click

Manually track a click event

### POST /api/track/conversion

Track a conversion event

### GET /api/analytics?range=7d&funnelId=uuid

Get analytics data with optional filters

### GET /api/offers

List all offers

### POST /api/offers

Create new offer

### PUT /api/offers/[id]

Update offer

### DELETE /api/offers/[id]

Delete offer

## Pages

### /offers

Manage affiliate offers, copy tracking links

### /analytics

View click and conversion analytics

### /example-funnel

Demo page showing tracking implementation

## Best Practices

1. **Always use UTM parameters** - Track where traffic comes from
2. **Test tracking links** - Verify clicks are being logged
3. **Monitor attribution** - Check that conversions are properly linked
4. **Set up conversion pixels** - For offers where you control the thank-you page
5. **Regular analytics review** - Check which sources perform best
6. **Clean data** - Remove test clicks periodically

## Example Use Cases

### Case 1: Facebook Ad Campaign

```
Link: /api/redirect/offer-123?utm_source=facebook&utm_medium=cpc&utm_campaign=summer-sale
```

### Case 2: Email Newsletter

```
Link: /api/redirect/offer-123?utm_source=newsletter&utm_medium=email&utm_campaign=weekly-digest
```

### Case 3: YouTube Video

```
Link: /api/redirect/offer-123?utm_source=youtube&utm_medium=video&utm_campaign=review-video
```

## Testing

1. Add a test offer
2. Copy tracking link
3. Click the link in incognito browser
4. Check `/analytics` to verify click was tracked
5. Check browser cookies for `aff_click_id`
6. Test conversion tracking endpoint
7. Verify conversion shows in analytics

## Troubleshooting

**Clicks not tracking?**

- Check Supabase connection
- Verify offer exists and is active
- Check browser console for errors

**Conversions not attributing?**

- Verify attribution cookie exists
- Check 30-day window hasn't expired
- Ensure conversion endpoint receives cookie

**Analytics not showing data?**

- Check date range filter
- Verify funnel_id filter if used
- Check database for records directly
