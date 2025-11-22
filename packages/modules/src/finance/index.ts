import { ModuleContract } from '@modular-affiliate/sdk'

const financeModule: ModuleContract = {
  module_id: 'personal-finance',
  name: 'Personal Finance',
  version: '1.0.0',
  routes: [
    '/finance',
    '/finance/investing',
    '/finance/budgeting',
    '/finance/crypto',
  ],
  templates: [
    {
      id: 'finance-hero-1',
      name: 'Finance Hero Section',
      type: 'block',
      content: JSON.stringify({
        type: 'hero',
        headline: 'Take Control of Your Financial Future',
        subheadline: 'Smart investing strategies for everyone',
        cta: 'Start Investing Today',
        image: '/assets/finance/hero-1.jpg',
      }),
    },
    {
      id: 'finance-benefits-1',
      name: 'Finance Benefits Grid',
      type: 'block',
      content: JSON.stringify({
        type: 'benefits',
        title: 'Why Choose Our Platform',
        items: [
          {
            icon: 'dollar',
            title: 'Low Fees',
            description: 'Keep more of your money with our competitive rates',
          },
          {
            icon: 'shield',
            title: 'Secure & Safe',
            description: 'Bank-level security for your investments',
          },
          {
            icon: 'trending',
            title: 'Easy to Use',
            description: 'Invest in minutes with our intuitive platform',
          },
        ],
      }),
    },
    {
      id: 'finance-email-welcome',
      name: 'Welcome Email Template',
      type: 'email',
      content: JSON.stringify({
        subject: 'Welcome to Smart Investing',
        body: `Hi {{name}},

Congratulations on taking the first step toward financial freedom!

Your account is ready. Here's what to do next:
1. Complete your investment profile
2. Browse our recommended portfolios
3. Make your first investment

Ready to get started?

Best regards,
Your Finance Team`,
      }),
    },
  ],
  assets: [
    {
      id: 'finance-logo',
      type: 'image',
      url: '/assets/finance/logo.svg',
    },
    {
      id: 'finance-styles',
      type: 'css',
      url: '/assets/finance/styles.css',
    },
  ],
  permissions: ['read:finance', 'write:finance', 'manage:offers'],
}

export default financeModule
