# Sendshark Email Integration Guide

## Setup

1. Get your Sendshark API key from [Sendshark Dashboard](https://sendshark.com/dashboard)
2. Add to your environment variables:

```env
SENDSHARK_API_KEY=your_api_key_here
SENDSHARK_API_URL=https://api.sendshark.com/v1
```

## Features

### Email Campaigns
- Create and send email campaigns
- Schedule emails for future delivery
- Track opens, clicks, and conversions

### Automation Sequences
- Welcome email series for new leads
- Abandoned cart recovery
- Custom trigger-based automations

### Analytics & Reporting
- Automated weekly performance reports
- Campaign statistics and metrics
- Email engagement tracking

## API Endpoints

### Send Email
```typescript
POST /api/email/send
{
  "to": "user@example.com",
  "subject": "Your Subject",
  "html": "<p>Email content</p>",
  "trackOpens": true,
  "trackClicks": true
}
```

### Create Campaign
```typescript
POST /api/email/send
{
  "type": "campaign",
  "name": "My Campaign",
  "subject": "Campaign Subject",
  "recipients": [
    { "email": "user1@example.com", "name": "User 1" }
  ]
}
```

### Trigger Automation
```typescript
POST /api/email/automation
{
  "action": "trigger",
  "automationId": "auto_123",
  "recipient": {
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Send Weekly Report
```typescript
POST /api/email/reports
{
  "recipientEmail": "admin@example.com",
  "funnelId": "funnel_123",
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-07"
  }
}
```

## Lead Capture Integration

When a lead is captured through a funnel, the system automatically:
1. Saves the lead to the database
2. Adds them to Sendshark subscriber list
3. Triggers welcome automation sequence
4. Tags them with funnel and source information

Example:
```typescript
POST /api/leads/capture
{
  "email": "newlead@example.com",
  "name": "New Lead",
  "funnelId": "funnel_123",
  "source": "facebook-ads",
  "customFields": {
    "interest": "weight-loss"
  }
}
```

## Default Automations

The system includes pre-configured automation sequences:

1. **Welcome Sequence** (3 emails)
   - Immediate: Welcome + exclusive offer
   - Day 1: Value delivery email
   - Day 3: Follow-up and engagement

2. **Abandoned Cart Recovery** (2 emails)
   - 1 hour: Reminder with 10% discount
   - 24 hours: Last chance offer

Setup default automations:
```typescript
PUT /api/email/automation
```

## Best Practices

1. **Segment Your Audience**: Use tags and custom fields to personalize campaigns
2. **Test Before Sending**: Use the preview feature to test emails
3. **Monitor Metrics**: Track open rates and adjust subject lines accordingly
4. **Respect Privacy**: Include unsubscribe links in all campaigns
5. **Timing Matters**: Schedule emails during peak engagement hours

## Troubleshooting

### Email Not Sending
- Verify SENDSHARK_API_KEY is set correctly
- Check API quota limits
- Review email content for spam triggers

### Low Open Rates
- Improve subject lines
- Clean subscriber list
- Send at optimal times

### Automation Not Triggering
- Verify automation is active
- Check trigger conditions
- Review automation configuration

## Support

For Sendshark-specific issues, contact support@sendshark.com
For integration issues, check the application logs or contact your development team.
