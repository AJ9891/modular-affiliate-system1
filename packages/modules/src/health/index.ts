import { ModuleContract } from '@modular-affiliate/sdk'

const healthModule: ModuleContract = {
  module_id: 'health-wellness',
  name: 'Health & Wellness',
  version: '1.0.0',
  routes: [
    '/health',
    '/health/weight-loss',
    '/health/fitness',
    '/health/nutrition',
  ],
  templates: [
    {
      id: 'health-hero-1',
      name: 'Health Hero Section',
      type: 'block',
      content: JSON.stringify({
        type: 'hero',
        headline: 'Transform Your Health Journey',
        subheadline: 'Science-backed solutions for lasting wellness',
        cta: 'Start Your Transformation',
        image: '/assets/health/hero-1.jpg',
      }),
    },
    {
      id: 'health-benefits-1',
      name: 'Health Benefits Grid',
      type: 'block',
      content: JSON.stringify({
        type: 'benefits',
        title: 'Why Our Health Program Works',
        items: [
          {
            icon: 'heart',
            title: 'Proven Results',
            description: 'Backed by clinical studies and real success stories',
          },
          {
            icon: 'users',
            title: 'Expert Support',
            description: 'Certified health coaches guide you every step',
          },
          {
            icon: 'chart',
            title: 'Track Progress',
            description: 'Monitor your improvements with smart analytics',
          },
        ],
      }),
    },
    {
      id: 'health-email-welcome',
      name: 'Welcome Email Template',
      type: 'email',
      content: JSON.stringify({
        subject: 'Welcome to Your Health Transformation',
        body: `Hi {{name}},

Welcome to our health and wellness community! We're thrilled to have you on this journey.

Here's what you can expect:
- Personalized health plans
- Weekly coaching sessions
- Nutrition guidance
- Fitness tracking

Let's get started!

Best regards,
Your Health Team`,
      }),
    },
  ],
  assets: [
    {
      id: 'health-logo',
      type: 'image',
      url: '/assets/health/logo.svg',
    },
    {
      id: 'health-styles',
      type: 'css',
      url: '/assets/health/styles.css',
    },
  ],
  permissions: ['read:health', 'write:health', 'manage:offers'],
}

export default healthModule
