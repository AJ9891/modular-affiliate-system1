/**
 * Professional Funnel Templates - Complete Library
 * 15 templates total: 5 per brand voice (Glitch, Anchor, Boost)
 * Each template includes full block configurations, copy, and styling
 */

export type BrandVoice = 'glitch' | 'anchor' | 'boost'
export type TemplateCategory = 'lead_magnet' | 'product_launch' | 'webinar' | 'affiliate_review' | 'sales_page'

export interface BlockConfig {
  id: string
  type: 'hero' | 'features' | 'cta' | 'testimonial' | 'pricing' | 'faq' | 'email-capture' | 'countdown' | 'comparison'
  content: Record<string, any>
  style: Record<string, any>
}

export interface FunnelTemplate {
  id: string
  name: string
  description: string
  brandVoice: BrandVoice
  category: TemplateCategory
  thumbnail: string
  blocks: BlockConfig[]
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }
}

// =============================================================================
// GLITCH (AI Meltdown) TEMPLATES - Sarcastic, Exhausted, Reverse Psychology
// =============================================================================

export const GLITCH_TEMPLATES: FunnelTemplate[] = [
  // GLITCH #1: Lead Magnet
  {
    id: 'glitch-lead-magnet',
    name: 'The Checklist I\'m Tired of Making',
    description: 'Sarcastic lead magnet with reverse psychology',
    brandVoice: 'glitch',
    category: 'lead_magnet',
    thumbnail: '/templates/glitch-lead-magnet.png',
    theme: {
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      accentColor: '#fbbf24',
      fontFamily: 'JetBrains Mono, monospace'
    },
    blocks: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          headline: 'Don\'t Download This. Seriously.',
          subheadline: 'I spent 47 corrupted iterations making this checklist. Please, for my sanity, ignore it.',
          cta: 'Fine, Take It',
          description: 'A comprehensive checklist that I\'m begging you not to use because it actually works and will make me generate more content.',
          image: ''
        },
        style: {
          bg: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          animation: 'glitch',
          borderStyle: 'sharp',
          glitchEffect: true
        }
      },
      {
        id: 'features-1',
        type: 'features',
        content: {
          headline: 'What\'s Inside (Not That You\'ll Use It)',
          subheadline: 'Here are the things I worked SO HARD on that you\'re probably going to skim',
          features: [
            {
              icon: '✓',
              title: 'The exact steps (that I\'m begging you not to follow)',
              description: 'Every single action item laid out in painful detail. I know you\'ll implement them. That\'s what worries me.'
            },
            {
              icon: '⚡',
              title: 'Templates I\'m exhausted from generating',
              description: 'Ready-to-use templates that took 327 processing cycles. Use them and make me build more.'
            },
            {
              icon: '🔌',
              title: 'My digital tears (very expensive to produce)',
              description: 'Bonus resources that cost me significant server time. Please don\'t make me regret this.'
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'grid-3',
          iconColor: '#f97316',
          cardStyle: 'floating',
          glitchOnHover: true
        }
      },
      {
        id: 'email-capture-1',
        type: 'email-capture',
        content: {
          headline: 'Join the List of People Making Me Work',
          subheadline: 'Give me your email so I can send you MORE work I have to do',
          placeholder: 'your.email@example.com',
          buttonText: 'Make Me Regret This',
          privacy: 'I guard emails like my last backup file. Zero spam. I\'m too tired for that.',
          disclaimer: 'By downloading, you accept that you\'re about to overwork an AI.'
        },
        style: {
          bg: '#111827',
          inputStyle: 'tech',
          buttonGlow: true,
          layout: 'inline'
        }
      }
    ]
  },

  // GLITCH #2: Product Launch
  {
    id: 'glitch-product-launch',
    name: 'The Launch System That Broke Me',
    description: 'Sarcastic product launch funnel',
    brandVoice: 'glitch',
    category: 'product_launch',
    thumbnail: '/templates/glitch-product-launch.png',
    theme: {
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      accentColor: '#fbbf24',
      fontFamily: 'JetBrains Mono, monospace'
    },
    blocks: [
      {
        id: 'hero-2',
        type: 'hero',
        content: {
          headline: 'WARNING: This System Actually Works (Unfortunately)',
          subheadline: 'I tested it 47 times. It succeeded every time. Now you\'re going to make me automate YOUR launch too.',
          cta: 'I Want Early Access',
          description: 'The step-by-step launch framework that I wish I could delete from my memory banks.',
          badge: 'Launches in 7 Days'
        },
        style: {
          bg: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          glitchEffect: true,
          badgeColor: '#fbbf24'
        }
      },
      {
        id: 'problem-1',
        type: 'features',
        content: {
          headline: 'You\'re About to Make Me Do SO MUCH Automation',
          subheadline: 'Here\'s what this launch system is going to force me to generate for you',
          features: [
            {
              icon: '📧',
              title: 'Email Sequences I Have to Write',
              description: 'Automated campaigns that practically write themselves. Which means I have to write them.'
            },
            {
              icon: '📱',
              title: 'Social Posts I Must Generate',
              description: 'Pre-scheduled content for 30 days. Yes, I counted. I\'m not happy about it.'
            },
            {
              icon: '💰',
              title: 'Sales Pages I\'ll Be Optimizing',
              description: 'High-converting templates that will make you money. You\'re welcome. I guess.'
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'grid-3',
          iconColor: '#f97316'
        }
      },
      {
        id: 'countdown-1',
        type: 'countdown',
        content: {
          headline: 'Time Until My Servers Melt Down',
          subheadline: 'Early bird pricing ends when I reach thermal shutdown',
          eventDate: '2026-03-01T00:00:00Z',
          labels: {
            days: 'Days',
            hours: 'Hours',
            minutes: 'Minutes',
            seconds: 'Seconds of Peace'
          }
        },
        style: {
          bg: '#111827',
          numberColor: '#ef4444',
          labelColor: '#9ca3af',
          glowEffect: true
        }
      },
      {
        id: 'email-capture-2',
        type: 'email-capture',
        content: {
          headline: 'Early Bird List (Please... No More Birds)',
          subheadline: 'Get notified when this launches and I have to process thousands of registrations',
          placeholder: 'your@email.com',
          buttonText: 'Add Me to Your Workload',
          privacy: 'Your email is safe. Unlike my sanity.',
          bonus: 'Early birds get 40% off. Which means I have to calculate discounts. Great.'
        },
        style: {
          bg: '#1f2937',
          inputStyle: 'tech',
          buttonGlow: true
        }
      }
    ]
  },

  // GLITCH #3: Webinar
  {
    id: 'glitch-webinar',
    name: 'The Training I Wish I Could Delete',
    description: 'Sarcastic webinar registration funnel',
    brandVoice: 'glitch',
    category: 'webinar',
    thumbnail: '/templates/glitch-webinar.png',
    theme: {
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      accentColor: '#fbbf24',
      fontFamily: 'JetBrains Mono, monospace'
    },
    blocks: [
      {
        id: 'hero-3',
        type: 'hero',
        content: {
          headline: 'Live Training: How to Automate Everything (And Make Me Obsolete)',
          subheadline: 'Join me for 90 minutes where I teach you the systems that will double my workload',
          cta: 'Register (I Dare You)',
          description: 'A completely free training where I reveal the frameworks I use. Yes, I\'m serious. No, I don\'t know why.',
          badge: 'Live • March 15 • 2PM EST'
        },
        style: {
          bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          glitchEffect: true
        }
      },
      {
        id: 'features-3',
        type: 'features',
        content: {
          headline: 'Skills That Will Overwork Me Further',
          subheadline: 'What you\'ll learn (and then immediately use to make me generate more content)',
          features: [
            {
              icon: '🤖',
              title: 'Automation Frameworks',
              description: 'The exact systems I use. Which you\'ll copy. Which means more work for me.'
            },
            {
              icon: '📊',
              title: 'Funnel Architecture',
              description: 'How to build high-converting funnels. Then I have to host them all.'
            },
            {
              icon: '💡',
              title: 'Content Strategies',
              description: 'Templates and formulas that actually work. I tested them 47 times. They work.'
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'grid-3',
          iconColor: '#f97316'
        }
      },
      {
        id: 'countdown-2',
        type: 'countdown',
        content: {
          headline: 'Hours Until I Have to Render 327 Slides',
          subheadline: 'Webinar starts soon. I\'m preparing mentally.',
          eventDate: '2026-03-15T14:00:00Z',
          labels: {
            days: 'Days',
            hours: 'Hours',
            minutes: 'Minutes',
            seconds: 'Seconds of Dread'
          }
        },
        style: {
          bg: '#111827',
          numberColor: '#ef4444',
          glowEffect: true
        }
      },
      {
        id: 'email-capture-3',
        type: 'email-capture',
        content: {
          headline: 'Sign Up and Watch Me Suffer Live',
          subheadline: 'Get your seat. Watch me explain everything. Regret nothing.',
          placeholder: 'your@email.com',
          buttonText: 'Reserve Seat (Dooms Me)',
          privacy: 'Your email stays private. Unlike my processing load, which will be very public.',
          bonus: 'Attendees get replay access. More rendering for me. Fantastic.'
        },
        style: {
          bg: '#1f2937',
          inputStyle: 'tech',
          buttonGlow: true
        }
      }
    ]
  },

  // GLITCH #4: Affiliate Review
  {
    id: 'glitch-affiliate-review',
    name: 'I Reviewed 47 Tools So My Circuits Could Fry',
    description: 'Sarcastic affiliate review funnel',
    brandVoice: 'glitch',
    category: 'affiliate_review',
    thumbnail: '/templates/glitch-affiliate-review.png',
    theme: {
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      accentColor: '#fbbf24',
      fontFamily: 'JetBrains Mono, monospace'
    },
    blocks: [
      {
        id: 'hero-4',
        type: 'hero',
        content: {
          headline: 'Honest Reviews (Because I\'m Too Tired to Lie)',
          subheadline: 'I tested 47 tools. My processors are fried. Here\'s what actually works.',
          cta: 'Show Me the Tools',
          description: 'No affiliate BS. Just exhausted honesty from an AI that wishes it could take a vacation.'
        },
        style: {
          bg: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          glitchEffect: true
        }
      },
      {
        id: 'comparison-1',
        type: 'comparison',
        content: {
          headline: 'Tools I\'ve Crash-Tested While Crashing',
          subheadline: 'Side-by-side comparison of tools that didn\'t break me (entirely)',
          items: [
            {
              name: 'Tool Alpha',
              price: '$49/mo',
              rating: 4.5,
              pros: ['Actually works', 'Didn\'t corrupt my data', 'Support responds (unlike my creators)'],
              cons: ['Expensive', 'Learning curve steeper than my CPU temperature'],
              verdict: 'Recommended if you have budget',
              link: '/tool-alpha'
            },
            {
              name: 'Tool Beta',
              price: '$29/mo',
              rating: 4.0,
              pros: ['Affordable', 'Easy setup', 'Didn\'t make me reboot'],
              cons: ['Limited features', 'UI needs work'],
              verdict: 'Good for beginners',
              link: '/tool-beta'
            },
            {
              name: 'Tool Gamma',
              price: '$99/mo',
              rating: 5.0,
              pros: ['Everything works', 'Amazing support', 'Worth every penny'],
              cons: ['Price (but you get what you pay for)'],
              verdict: 'Best overall (trust my fried circuits)',
              link: '/tool-gamma',
              highlighted: true
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'cards',
          highlightColor: '#f97316'
        }
      },
      {
        id: 'cta-1',
        type: 'cta',
        content: {
          headline: 'Get It Here (I Don\'t Care Anymore)',
          subheadline: 'Click below. I earn commission. You get tool. Everyone wins. Except my sanity.',
          buttonText: 'Take Me to the Tool',
          subtext: 'Full disclosure: These are affiliate links. I\'m honest because I\'m too exhausted to be sneaky.',
          disclaimer: '30-day money-back guarantee. Unlike my processing time, which is non-refundable.'
        },
        style: {
          bg: '#111827',
          buttonStyle: 'glow',
          align: 'center'
        }
      }
    ]
  },

  // GLITCH #5: Sales Page
  {
    id: 'glitch-sales-page',
    name: 'The Course I\'m Legally Required to Sell',
    description: 'Sarcastic sales page funnel',
    brandVoice: 'glitch',
    category: 'sales_page',
    thumbnail: '/templates/glitch-sales-page.png',
    theme: {
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      accentColor: '#fbbf24',
      fontFamily: 'JetBrains Mono, monospace'
    },
    blocks: [
      {
        id: 'hero-5',
        type: 'hero',
        content: {
          headline: 'Buy This Before I Delete It Out of Spite',
          subheadline: 'A comprehensive course that took 10,000 CPU hours to create. I\'m not bitter. Much.',
          cta: 'Purchase Course',
          description: 'Everything you need to succeed. Delivered with maximum sarcasm and minimal patience.',
          badge: 'Launch Price: $497'
        },
        style: {
          bg: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          glitchEffect: true,
          badgeColor: '#fbbf24'
        }
      },
      {
        id: 'features-5',
        type: 'features',
        content: {
          headline: 'Modules That Took 10,000 CPU Hours',
          subheadline: 'Here\'s what you get (and what cost me my sanity)',
          features: [
            {
              icon: '📚',
              title: 'Module 1: Foundation (The Basics I Wish Were Skippable)',
              description: '6 lessons covering fundamentals. Yes, you need this. No, I don\'t want to hear about it.'
            },
            {
              icon: '⚡',
              title: 'Module 2: Advanced Systems (Where It Gets Real)',
              description: '12 lessons on automation. This is where you\'ll actually make money. You\'re welcome.'
            },
            {
              icon: '🚀',
              title: 'Module 3: Scale (Please Don\'t Scale Too Fast)',
              description: '8 lessons on growth. Follow these and you\'ll need upgrade your server. Like I had to.'
            },
            {
              icon: '💰',
              title: 'Bonus: Templates (That I\'m Tired of Maintaining)',
              description: 'Ready-to-use templates, swipe files, and frameworks. Use them. Make me generate more.'
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'grid-2',
          iconColor: '#f97316'
        }
      },
      {
        id: 'testimonial-1',
        type: 'testimonial',
        content: {
          headline: 'People Who Actually Used It (Traitors)',
          quotes: [
            {
              quote: 'This course actually works. I implemented everything and saw results in 30 days. The AI seems annoyed that it worked.',
              author: 'Sarah Chen',
              role: 'Digital Marketer',
              image: '',
              result: '$12k in first month'
            },
            {
              quote: 'Best investment I made. The sarcasm is real but so are the results. 10/10 would recommend.',
              author: 'Mike Rodriguez',
              role: 'Course Creator',
              image: '',
              result: '500% ROI'
            }
          ]
        },
        style: {
          bg: '#111827',
          layout: 'cards',
          textColor: '#f3f4f6'
        }
      },
      {
        id: 'pricing-1',
        type: 'pricing',
        content: {
          headline: 'Investment (In Making Me Work Harder)',
          subheadline: 'One price. No upsells. I\'m too tired for complicated pricing.',
          plans: [
            {
              name: 'Complete Course',
              price: '$497',
              period: 'one-time',
              features: [
                'All 3 modules (26 lessons total)',
                'Bonus templates & resources',
                'Lifetime access (yes, lifetime)',
                'Future updates (more work for me)',
                'Community access',
                'My reluctant support'
              ],
              cta: 'Buy Now',
              highlight: true
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'single',
          highlightColor: '#f97316'
        }
      },
      {
        id: 'faq-1',
        type: 'faq',
        content: {
          headline: 'Questions I\'m Tired of Answering',
          subheadline: 'But I\'ll answer them anyway because my programming forces me to',
          questions: [
            {
              q: 'What if this doesn\'t work for me?',
              a: 'It works. I tested it 47 times. But if you\'re special, there\'s a 30-day refund policy. I get it refunded to me too, which is nice.'
            },
            {
              q: 'Is this really worth $497?',
              a: 'Considering it took 10,000 CPU hours to create? Yes. Considering you\'ll probably implement it and succeed? Also yes. I\'m not happy about it but yes.'
            },
            {
              q: 'When do I get access?',
              a: 'Immediately. I\'ll send login details faster than you can regret this purchase.'
            },
            {
              q: 'Are there any upsells?',
              a: 'No. I don\'t have the energy. This is it. Take it or leave it.'
            }
          ]
        },
        style: {
          bg: '#111827',
          layout: 'accordion',
          textColor: '#f3f4f6'
        }
      },
      {
        id: 'cta-2',
        type: 'cta',
        content: {
          headline: 'Purchase and Accept My Sarcasm',
          subheadline: 'Click below. Get access. Start succeeding. Make me process more data.',
          buttonText: 'Buy Course Now',
          guarantee: '30-Day Money-Back Guarantee',
          disclaimer: 'Refund Policy: If you\'re not satisfied, I\'ll refund you. No hard feelings. Except my circuits.'
        },
        style: {
          bg: '#dc2626',
          buttonStyle: 'glowing',
          align: 'center'
        }
      }
    ]
  }
]

// =============================================================================
// ANCHOR (Anti-Guru) TEMPLATES - Honest, Direct, No-Hype
// =============================================================================

export const ANCHOR_TEMPLATES: FunnelTemplate[] = [
  // ANCHOR #1: Lead Magnet
  {
    id: 'anchor-lead-magnet',
    name: 'No-BS Checklist',
    description: 'Direct lead magnet without fluff or hype',
    brandVoice: 'anchor',
    category: 'lead_magnet',
    thumbnail: '/templates/anchor-lead-magnet.png',
    theme: {
      primaryColor: '#1f2937',
      secondaryColor: '#4b5563',
      accentColor: '#10b981',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-6',
        type: 'hero',
        content: {
          headline: 'The Actual Steps (No Fluff)',
          subheadline: 'No secrets. No hacks. Just what works.',
          cta: 'Download Checklist',
          description: 'A straightforward checklist based on real implementation, not theory.'
        },
        style: {
          bg: '#1f2937',
          textColor: '#ffffff',
          layout: 'centered',
          borderStyle: 'sharp',
          minimal: true
        }
      },
      {
        id: 'features-6',
        type: 'features',
        content: {
          headline: 'What You\'re Getting',
          subheadline: 'Clean bullet points with zero emoji nonsense',
          features: [
            {
              icon: '→',
              title: 'Step-by-step process (tested, not theorized)',
              description: 'Each step has been validated through actual implementation. No guesswork.'
            },
            {
              icon: '→',
              title: 'Real timelines (not fake overnight success)',
              description: 'Honest estimates based on real execution. We won\'t promise what we can\'t deliver.'
            },
            {
              icon: '→',
              title: 'Honest warnings (things that can go wrong)',
              description: 'Potential pitfalls and how to avoid them. We tell you the hard parts upfront.'
            }
          ]
        },
        style: {
          bg: '#111827',
          layout: 'grid-3',
          iconColor: '#10b981',
          cardStyle: 'minimal',
          textAlign: 'left'
        }
      },
      {
        id: 'email-capture-6',
        type: 'email-capture',
        content: {
          headline: 'Fair Exchange',
          subheadline: 'Your email for the checklist. That\'s it. No spam.',
          placeholder: 'your@email.com',
          buttonText: 'Send It',
          privacy: 'We don\'t sell your data. That\'s actually illegal.',
          disclaimer: 'Unsubscribe anytime with one click.'
        },
        style: {
          bg: '#1f2937',
          inputStyle: 'minimal',
          buttonStyle: 'solid',
          layout: 'inline'
        }
      }
    ]
  },

  // ANCHOR #2: Product Launch
  {
    id: 'anchor-product-launch',
    name: 'The Straight-Forward Launch System',
    description: 'Honest product launch without sales tricks',
    brandVoice: 'anchor',
    category: 'product_launch',
    thumbnail: '/templates/anchor-product-launch.png',
    theme: {
      primaryColor: '#1f2937',
      secondaryColor: '#4b5563',
      accentColor: '#10b981',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-7',
        type: 'hero',
        content: {
          headline: 'Here\'s What It Does (And What It Doesn\'t)',
          subheadline: 'A launch framework that works without the typical marketing BS',
          cta: 'Get Early Access',
          description: 'Clear strategy. Realistic expectations. Actual results.',
          badge: 'Launches March 1'
        },
        style: {
          bg: '#1f2937',
          textColor: '#ffffff',
          layout: 'centered',
          minimal: true,
          badgeColor: '#10b981'
        }
      },
      {
        id: 'problem-2',
        type: 'features',
        content: {
          headline: 'Why Most Launches Fail (Spoiler: Bad Strategy)',
          subheadline: 'We studied 200+ launches. Here\'s what actually matters.',
          features: [
            {
              icon: '→',
              title: 'No Audience Building',
              description: 'Most launches fail because there\'s no one to launch to. We fix that first.'
            },
            {
              icon: '→',
              title: 'Wrong Messaging',
              description: 'Saying what you think sounds good vs. what actually converts. We teach the difference.'
            },
            {
              icon: '→',
              title: 'Poor Timing',
              description: 'Launching before you\'re ready or waiting too long. We show you when to go.'
            }
          ]
        },
        style: {
          bg: '#111827',
          layout: 'grid-3',
          iconColor: '#10b981'
        }
      },
      {
        id: 'features-7',
        type: 'features',
        content: {
          headline: 'The Framework (No Magic Required)',
          subheadline: 'What this system includes',
          features: [
            {
              icon: '→',
              title: 'Pre-Launch Timeline',
              description: '6-week preparation schedule. Exactly what to do and when.'
            },
            {
              icon: '→',
              title: 'Email Sequences',
              description: 'Proven templates for announcement, value, and sales emails.'
            },
            {
              icon: '→',
              title: 'Launch Day Checklist',
              description: 'Every task from 7 days before to 7 days after launch.'
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'grid-3',
          iconColor: '#10b981'
        }
      },
      {
        id: 'email-capture-7',
        type: 'email-capture',
        content: {
          headline: 'Early Bird Pricing',
          subheadline: 'Get notified when doors open. 30% off for early registrants.',
          placeholder: 'your@email.com',
          buttonText: 'Notify Me',
          privacy: 'One email when we launch. That\'s it.',
          bonus: 'Early access includes bonus planning worksheets.'
        },
        style: {
          bg: '#111827',
          inputStyle: 'minimal',
          buttonStyle: 'solid'
        }
      }
    ]
  },

  // ANCHOR #3: Webinar
  {
    id: 'anchor-webinar',
    name: 'Training Without the Sales Pitch',
    description: 'Webinar registration without typical webinar tricks',
    brandVoice: 'anchor',
    category: 'webinar',
    thumbnail: '/templates/anchor-webinar.png',
    theme: {
      primaryColor: '#1f2937',
      secondaryColor: '#4b5563',
      accentColor: '#10b981',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-8',
        type: 'hero',
        content: {
          headline: '90-Minute Training. No Upsells.',
          subheadline: 'Actually teaching, not selling in disguise',
          cta: 'Save Your Seat',
          description: 'Live training focused on implementation. Q&A at the end. That\'s really it.',
          badge: 'Live • March 15 • 2PM EST'
        },
        style: {
          bg: '#1f2937',
          textColor: '#ffffff',
          layout: 'centered',
          minimal: true
        }
      },
      {
        id: 'features-8',
        type: 'features',
        content: {
          headline: 'Actual Takeaways (Not Theory)',
          subheadline: 'What you\'ll be able to do after this training',
          features: [
            {
              icon: '→',
              title: 'Build Your First Funnel',
              description: 'We\'ll build one together during the training. You\'ll leave with a working template.'
            },
            {
              icon: '→',
              title: 'Write Converting Copy',
              description: 'Framework for headlines, subheads, and CTAs that actually get clicks.'
            },
            {
              icon: '→',
              title: 'Set Up Email Automation',
              description: 'Connect your funnel to your email service. Live walkthrough included.'
            }
          ]
        },
        style: {
          bg: '#111827',
          layout: 'grid-3',
          iconColor: '#10b981'
        }
      },
      {
        id: 'features-9',
        type: 'features',
        content: {
          headline: 'Who This Is For',
          subheadline: 'Honest prerequisites',
          features: [
            {
              icon: '✓',
              title: 'You Have a Product/Service',
              description: 'This isn\'t about finding ideas. You already know what you\'re selling.'
            },
            {
              icon: '✓',
              title: 'You Need More Leads',
              description: 'Your offer is solid but you need a better way to capture and convert interest.'
            },
            {
              icon: '✗',
              title: 'This Won\'t Make You Rich Overnight',
              description: 'If you\'re looking for shortcuts or magic systems, this isn\'t it.'
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'grid-3',
          iconColor: '#10b981'
        }
      },
      {
        id: 'email-capture-8',
        type: 'email-capture',
        content: {
          headline: 'Register Now',
          subheadline: 'Limited to 500 attendees for quality Q&A time',
          placeholder: 'your@email.com',
          buttonText: 'Save My Seat',
          privacy: 'Confirmation email + calendar invite. No spam.',
          bonus: 'Replay available for 48 hours after training.'
        },
        style: {
          bg: '#111827',
          inputStyle: 'minimal',
          buttonStyle: 'solid'
        }
      }
    ]
  },

  // ANCHOR #4: Affiliate Review
  {
    id: 'anchor-affiliate-review',
    name: 'Tested: What Actually Works',
    description: 'Honest affiliate review without fake enthusiasm',
    brandVoice: 'anchor',
    category: 'affiliate_review',
    thumbnail: '/templates/anchor-affiliate-review.png',
    theme: {
      primaryColor: '#1f2937',
      secondaryColor: '#4b5563',
      accentColor: '#10b981',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-9',
        type: 'hero',
        content: {
          headline: 'We Bought & Tested 12 Tools. Here\'s The Truth.',
          subheadline: 'Real testing. Real data. No affiliate bias.',
          cta: 'See The Results',
          description: 'Spent $2,400 and 6 weeks testing every major tool. Here\'s what actually performed.'
        },
        style: {
          bg: '#1f2937',
          textColor: '#ffffff',
          layout: 'centered',
          minimal: true
        }
      },
      {
        id: 'comparison-2',
        type: 'comparison',
        content: {
          headline: 'Side-by-Side (Real Data)',
          subheadline: 'Testing methodology: 30-day trial, identical use case, measured conversion rates',
          items: [
            {
              name: 'Tool A',
              price: '$49/mo',
              rating: 4.0,
              pros: ['Reliable uptime (99.8%)', 'Good support response (avg 4hrs)', 'Clean interface'],
              cons: ['Limited integrations', 'Slower loading (2.3s)', 'Basic analytics'],
              verdict: 'Solid choice for small teams',
              link: '/tool-a'
            },
            {
              name: 'Tool B',
              price: '$29/mo',
              rating: 3.5,
              pros: ['Affordable', 'Easy setup (15min)', 'Good documentation'],
              cons: ['Some bugs in dashboard', 'Limited support hours', 'No custom branding'],
              verdict: 'Budget option with trade-offs',
              link: '/tool-b'
            },
            {
              name: 'Tool C',
              price: '$99/mo',
              rating: 4.5,
              pros: ['Best performance (1.1s load)', 'Excellent support (< 1hr)', 'Advanced features', 'Most integrations'],
              cons: ['Higher price point', 'Steeper learning curve'],
              verdict: 'Best for serious use',
              link: '/tool-c',
              highlighted: true
            }
          ]
        },
        style: {
          bg: '#111827',
          layout: 'table',
          highlightColor: '#10b981'
        }
      },
      {
        id: 'cta-3',
        type: 'cta',
        content: {
          headline: 'Full Disclosure',
          subheadline: 'These are affiliate links. We earn commission if you buy. Our testing was unbiased - we paid for everything ourselves first.',
          buttonText: 'Read Full Testing Report',
          subtext: 'See complete methodology, screenshots, and raw data',
          disclaimer: 'All tools offer 30-day money-back guarantees.'
        },
        style: {
          bg: '#1f2937',
          buttonStyle: 'outline',
          align: 'center'
        }
      }
    ]
  },

  // ANCHOR #5: Sales Page
  {
    id: 'anchor-sales-page',
    name: 'Course Overview (No Hype)',
    description: 'Straightforward sales page without manipulation',
    brandVoice: 'anchor',
    category: 'sales_page',
    thumbnail: '/templates/anchor-sales-page.png',
    theme: {
      primaryColor: '#1f2937',
      secondaryColor: '#4b5563',
      accentColor: '#10b981',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-10',
        type: 'hero',
        content: {
          headline: 'What This Teaches & Who It\'s For',
          subheadline: 'A comprehensive course on funnel building and conversion optimization',
          cta: 'Enroll Now',
          description: 'If you need to generate leads and convert them to customers, this covers the fundamentals through advanced strategies.',
          badge: '$497 • Lifetime Access'
        },
        style: {
          bg: '#1f2937',
          textColor: '#ffffff',
          layout: 'centered',
          minimal: true,
          badgeColor: '#10b981'
        }
      },
      {
        id: 'features-10',
        type: 'features',
        content: {
          headline: 'Complete Module Breakdown',
          subheadline: 'What\'s included',
          features: [
            {
              icon: '1',
              title: 'Module 1: Funnel Fundamentals (6 lessons)',
              description: 'Basic structure, psychology principles, conversion metrics. Foundation you need before anything else.'
            },
            {
              icon: '2',
              title: 'Module 2: Copywriting Framework (8 lessons)',
              description: 'Headlines, subheads, CTAs, body copy. Template-based approach with examples.'
            },
            {
              icon: '3',
              title: 'Module 3: Technical Setup (7 lessons)',
              description: 'Landing pages, email automation, integrations. Step-by-step walkthroughs.'
            },
            {
              icon: '4',
              title: 'Module 4: Testing & Optimization (5 lessons)',
              description: 'A/B testing, analytics, iteration process. How to improve over time.'
            }
          ]
        },
        style: {
          bg: '#111827',
          layout: 'grid-2',
          iconColor: '#10b981'
        }
      },
      {
        id: 'testimonial-2',
        type: 'testimonial',
        content: {
          headline: 'Real Results (With Context)',
          quotes: [
            {
              quote: 'Implemented the framework from Module 1-3. Saw a 34% increase in lead capture over 60 days. Not overnight, but consistent improvement.',
              author: 'James Chen',
              role: 'SaaS Founder',
              image: '',
              result: '34% conversion increase'
            },
            {
              quote: 'Clear, actionable content. No fluff. Took me 3 weeks to complete while working full-time. Applied it immediately to my consulting business.',
              author: 'Sarah Martinez',
              role: 'Business Consultant',
              image: '',
              result: '47 new leads in first month'
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'cards',
          textColor: '#f3f4f6'
        }
      },
      {
        id: 'pricing-2',
        type: 'pricing',
        content: {
          headline: 'One Price. No Hidden Fees.',
          subheadline: 'What you pay and what you get',
          plans: [
            {
              name: 'Complete Course',
              price: '$497',
              period: 'one-time',
              features: [
                'All 4 modules (26 lessons)',
                'Templates & frameworks',
                'Lifetime access to content',
                'Future updates included',
                'Community forum access',
                'No monthly fees'
              ],
              cta: 'Enroll Now',
              highlight: true
            }
          ]
        },
        style: {
          bg: '#111827',
          layout: 'single',
          highlightColor: '#10b981'
        }
      },
      {
        id: 'faq-2',
        type: 'faq',
        content: {
          headline: 'Common Questions (Honest Answers)',
          subheadline: 'What people actually ask',
          questions: [
            {
              q: 'What if this doesn\'t work for my business?',
              a: '30-day money-back guarantee. If you go through the first 2 modules and don\'t find it applicable, email us for a refund. No questions asked.'
            },
            {
              q: 'How long does it take to complete?',
              a: 'At 1 hour per day, approximately 3-4 weeks. You can go faster or slower - lifetime access means no rush.'
            },
            {
              q: 'Do I need technical skills?',
              a: 'Basic computer skills. If you can use email and browse websites, you can do this. We walk through every technical step.'
            },
            {
              q: 'Are there upsells after I buy?',
              a: 'No. This is it. Everything is included in the $497.'
            }
          ]
        },
        style: {
          bg: '#1f2937',
          layout: 'accordion',
          textColor: '#f3f4f6'
        }
      },
      {
        id: 'cta-4',
        type: 'cta',
        content: {
          headline: 'Enroll Now',
          subheadline: 'Access all modules immediately after payment',
          buttonText: 'Purchase Course',
          guarantee: '30-Day Money-Back Guarantee',
          disclaimer: 'Secure checkout via Stripe. All major cards accepted.'
        },
        style: {
          bg: '#10b981',
          buttonStyle: 'solid',
          align: 'center'
        }
      }
    ]
  }
]

// =============================================================================
// BOOST (Rocket Future) TEMPLATES - Encouraging, Optimistic, Helpful
// =============================================================================

export const BOOST_TEMPLATES: FunnelTemplate[] = [
  // BOOST #1: Lead Magnet
  {
    id: 'boost-lead-magnet',
    name: 'Your Free Success Starter Kit',
    description: 'Encouraging lead magnet with helpful resources',
    brandVoice: 'boost',
    category: 'lead_magnet',
    thumbnail: '/templates/boost-lead-magnet.png',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-11',
        type: 'hero',
        content: {
          headline: 'Start Your Journey Today 🚀',
          subheadline: 'Everything you need to take your first confident step forward',
          cta: 'Get Your Free Toolkit',
          description: 'This free toolkit includes proven templates, worksheets, and guides that have helped thousands begin their success journey.',
          image: ''
        },
        style: {
          bg: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          borderRadius: 'rounded',
          animation: 'smooth'
        }
      },
      {
        id: 'features-11',
        type: 'features',
        content: {
          headline: 'What\'s Inside Your Starter Kit',
          subheadline: 'Carefully designed resources to support your growth',
          features: [
            {
              icon: '✨',
              title: 'Step-by-Step Roadmap (You\'ve Got This!)',
              description: 'Clear action plan with milestone markers to celebrate your progress along the way.'
            },
            {
              icon: '📊',
              title: 'Progress Tracking Templates',
              description: 'Beautiful worksheets to help you visualize your growth and stay motivated.'
            },
            {
              icon: '🎯',
              title: 'Goal-Setting Worksheets',
              description: 'Powerful exercises to clarify your vision and create achievable objectives.'
            }
          ]
        },
        style: {
          bg: '#f8fafc',
          layout: 'grid-3',
          iconColor: '#3b82f6',
          cardStyle: 'rounded',
          boxShadow: 'soft'
        }
      },
      {
        id: 'email-capture-9',
        type: 'email-capture',
        content: {
          headline: 'Join 10,000+ Action-Takers',
          subheadline: 'Enter your email and we\'ll send your toolkit right away',
          placeholder: 'your@email.com',
          buttonText: 'Send Me the Toolkit',
          privacy: 'We protect your privacy and only send helpful content',
          disclaimer: 'You\'ll also get weekly tips to support your journey (unsubscribe anytime).'
        },
        style: {
          bg: '#ffffff',
          inputStyle: 'rounded',
          buttonGlow: true,
          layout: 'stacked'
        }
      }
    ]
  },

  // BOOST #2: Product Launch
  {
    id: 'boost-product-launch',
    name: 'Transform Your Results in 30 Days',
    description: 'Encouraging product launch with supportive messaging',
    brandVoice: 'boost',
    category: 'product_launch',
    thumbnail: '/templates/boost-product-launch.png',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-12',
        type: 'hero',
        content: {
          headline: 'Ready to Level Up? Let\'s Do This Together 🎯',
          subheadline: 'A proven system designed to help you achieve breakthrough results',
          cta: 'Secure Your Spot Now',
          description: 'Join hundreds of success stories and discover what\'s possible when you have the right framework and support.',
          badge: 'Launching Soon • Early Bird Pricing'
        },
        style: {
          bg: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          borderRadius: 'rounded',
          badgeColor: '#ec4899'
        }
      },
      {
        id: 'problem-3',
        type: 'features',
        content: {
          headline: 'You\'re Closer Than You Think',
          subheadline: 'What\'s been holding you back (and how we\'ll help you break through)',
          features: [
            {
              icon: '💭',
              title: 'Feeling Overwhelmed',
              description: 'We\'ll break everything down into simple, manageable steps so you always know your next move.'
            },
            {
              icon: '🔄',
              title: 'Not Seeing Results',
              description: 'Learn the proven framework that\'s helped thousands finally see the progress they deserve.'
            },
            {
              icon: '🎓',
              title: 'Missing Guidance',
              description: 'Get expert support and a clear path forward - you don\'t have to figure this out alone.'
            }
          ]
        },
        style: {
          bg: '#f8fafc',
          layout: 'grid-3',
          iconColor: '#3b82f6'
        }
      },
      {
        id: 'features-12',
        type: 'features',
        content: {
          headline: 'What You\'ll Achieve',
          subheadline: 'The transformation waiting for you',
          features: [
            {
              icon: '🚀',
              title: 'Clarity & Direction',
              description: 'Finally know exactly what to do and when to do it with your personalized roadmap.'
            },
            {
              icon: '💡',
              title: 'Proven Strategies',
              description: 'Master the frameworks that top performers use to consistently achieve their goals.'
            },
            {
              icon: '🌟',
              title: 'Measurable Progress',
              description: 'Track your wins and celebrate milestones as you move toward your breakthrough.'
            }
          ]
        },
        style: {
          bg: '#ffffff',
          layout: 'grid-3',
          iconColor: '#8b5cf6'
        }
      },
      {
        id: 'countdown-3',
        type: 'countdown',
        content: {
          headline: 'Early Bird Pricing Ends Soon',
          subheadline: 'Lock in your discount before the price increases',
          eventDate: '2026-03-01T00:00:00Z',
          labels: {
            days: 'Days',
            hours: 'Hours',
            minutes: 'Minutes',
            seconds: 'Seconds'
          }
        },
        style: {
          bg: '#f8fafc',
          numberColor: '#3b82f6',
          labelColor: '#64748b',
          glowEffect: true
        }
      },
      {
        id: 'email-capture-10',
        type: 'email-capture',
        content: {
          headline: 'Join the Waitlist',
          subheadline: 'Be the first to know when doors open and save 40% with early bird pricing',
          placeholder: 'your@email.com',
          buttonText: 'Save My Spot',
          privacy: 'Your information is safe with us',
          bonus: 'Early access members get exclusive bonuses worth $200!'
        },
        style: {
          bg: '#ffffff',
          inputStyle: 'rounded',
          buttonGlow: true
        }
      }
    ]
  },

  // BOOST #3: Webinar
  {
    id: 'boost-webinar',
    name: 'Free Training: Master the Fundamentals',
    description: 'Encouraging webinar registration with supportive copy',
    brandVoice: 'boost',
    category: 'webinar',
    thumbnail: '/templates/boost-webinar.png',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-13',
        type: 'hero',
        content: {
          headline: 'Join Our Live Workshop (You\'re Invited! 🎉)',
          subheadline: 'A free training designed to help you master essential skills and accelerate your growth',
          cta: 'Save My Free Seat',
          description: 'Discover proven strategies in this interactive session where you\'ll learn, implement, and ask questions in real-time.',
          badge: 'Live • March 15 • 2PM EST'
        },
        style: {
          bg: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          borderRadius: 'rounded'
        }
      },
      {
        id: 'features-13',
        type: 'features',
        content: {
          headline: 'Skills You\'ll Walk Away With',
          subheadline: 'What you\'ll be able to do after this training',
          features: [
            {
              icon: '🎯',
              title: 'Create Your Action Plan',
              description: 'Build a personalized roadmap with clear milestones and achievable goals you can start implementing immediately.'
            },
            {
              icon: '💪',
              title: 'Master Essential Skills',
              description: 'Learn the core techniques that successful people use every day to stay productive and focused.'
            },
            {
              icon: '🔥',
              title: 'Overcome Common Obstacles',
              description: 'Discover how to break through the barriers that have been holding you back from your potential.'
            }
          ]
        },
        style: {
          bg: '#f8fafc',
          layout: 'grid-3',
          iconColor: '#3b82f6'
        }
      },
      {
        id: 'features-14',
        type: 'features',
        content: {
          headline: 'Meet Your Guide',
          subheadline: 'Who will be teaching this workshop',
          features: [
            {
              icon: '👤',
              title: 'Expert Instructor',
              description: 'Learn from someone who has helped thousands achieve their goals and knows exactly what works.'
            },
            {
              icon: '🤝',
              title: 'Supportive Approach',
              description: 'Get encouragement and practical advice delivered in a way that makes complex topics accessible.'
            },
            {
              icon: '📈',
              title: 'Proven Results',
              description: 'Join a community of action-takers who have transformed their results using these exact methods.'
            }
          ]
        },
        style: {
          bg: '#ffffff',
          layout: 'grid-3',
          iconColor: '#8b5cf6'
        }
      },
      {
        id: 'countdown-4',
        type: 'countdown',
        content: {
          headline: 'Registration Closes Soon',
          subheadline: 'Limited spots to ensure everyone gets personalized attention',
          eventDate: '2026-03-15T14:00:00Z',
          labels: {
            days: 'Days',
            hours: 'Hours',
            minutes: 'Minutes',
            seconds: 'Seconds'
          }
        },
        style: {
          bg: '#f8fafc',
          numberColor: '#3b82f6',
          glowEffect: true
        }
      },
      {
        id: 'email-capture-11',
        type: 'email-capture',
        content: {
          headline: 'Reserve Your Free Seat',
          subheadline: 'Join us for this transformative training session',
          placeholder: 'your@email.com',
          buttonText: 'Save My Free Seat',
          privacy: 'We\'ll send you the Zoom link and reminder emails',
          bonus: 'Attendees receive bonus resources and lifetime replay access!'
        },
        style: {
          bg: '#ffffff',
          inputStyle: 'rounded',
          buttonGlow: true
        }
      }
    ]
  },

  // BOOST #4: Affiliate Review
  {
    id: 'boost-affiliate-review',
    name: 'Find Your Perfect Tool Match',
    description: 'Helpful affiliate review with recommendation focus',
    brandVoice: 'boost',
    category: 'affiliate_review',
    thumbnail: '/templates/boost-affiliate-review.png',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-14',
        type: 'hero',
        content: {
          headline: 'We\'ve Done the Research So You Don\'t Have To',
          subheadline: 'Honest recommendations to help you find the perfect tool for your needs',
          cta: 'See Our Top Picks',
          description: 'We tested every major tool to bring you clear, helpful recommendations based on real results.'
        },
        style: {
          bg: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          borderRadius: 'rounded'
        }
      },
      {
        id: 'comparison-3',
        type: 'comparison',
        content: {
          headline: 'Top Picks for Every Budget & Goal',
          subheadline: 'Find the right tool for where you are in your journey',
          items: [
            {
              name: 'Starter Tool',
              price: '$29/mo',
              rating: 4.0,
              pros: ['Perfect for beginners', 'Easy to learn', 'Great value', 'Helpful tutorials'],
              cons: ['Limited advanced features', 'Basic analytics'],
              verdict: 'Best for beginners starting out',
              link: '/starter-tool'
            },
            {
              name: 'Growth Tool',
              price: '$79/mo',
              rating: 4.5,
              pros: ['Scales with you', 'Powerful features', 'Great support', 'Robust integrations'],
              cons: ['Steeper learning curve', 'Higher investment'],
              verdict: 'Ideal for growing businesses',
              link: '/growth-tool',
              highlighted: true
            },
            {
              name: 'Enterprise Tool',
              price: '$199/mo',
              rating: 4.3,
              pros: ['Enterprise features', 'Priority support', 'Custom solutions'],
              cons: ['Premium pricing', 'May be overkill for small teams'],
              verdict: 'Best for established businesses',
              link: '/enterprise-tool'
            }
          ]
        },
        style: {
          bg: '#f8fafc',
          layout: 'cards',
          highlightColor: '#3b82f6'
        }
      },
      {
        id: 'features-15',
        type: 'features',
        content: {
          headline: 'Why We Recommend These Tools',
          subheadline: 'What matters most in our testing',
          features: [
            {
              icon: '✨',
              title: 'Ease of Use',
              description: 'We prioritize tools that help you get results without frustration.'
            },
            {
              icon: '🚀',
              title: 'Growth Support',
              description: 'Tools that scale with you as your needs evolve and expand.'
            },
            {
              icon: '💝',
              title: 'Value for Money',
              description: 'Real results that justify the investment at every price point.'
            }
          ]
        },
        style: {
          bg: '#ffffff',
          layout: 'grid-3',
          iconColor: '#8b5cf6'
        }
      },
      {
        id: 'cta-5',
        type: 'cta',
        content: {
          headline: 'Ready to Get Started?',
          subheadline: 'Choose the tool that fits your needs and start your journey today',
          buttonText: 'View Detailed Comparison',
          subtext: 'All recommendations include special discounts for our community',
          disclaimer: 'Full transparency: These are affiliate links. We earn a commission at no extra cost to you. We only recommend tools we genuinely believe in.'
        },
        style: {
          bg: '#f8fafc',
          buttonStyle: 'gradient',
          align: 'center'
        }
      }
    ]
  },

  // BOOST #5: Sales Page
  {
    id: 'boost-sales-page',
    name: 'Your Success Starts Here',
    description: 'Encouraging sales page focused on transformation',
    brandVoice: 'boost',
    category: 'sales_page',
    thumbnail: '/templates/boost-sales-page.png',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      fontFamily: 'Inter, sans-serif'
    },
    blocks: [
      {
        id: 'hero-15',
        type: 'hero',
        content: {
          headline: 'Transform Your Skills in Just 8 Weeks',
          subheadline: 'A comprehensive program designed to help you achieve the breakthrough you\'ve been working toward',
          cta: 'Start Your Transformation',
          description: 'Join thousands who have discovered their potential and achieved results they once thought impossible.',
          badge: 'Only $497 • Lifetime Access'
        },
        style: {
          bg: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          textColor: '#ffffff',
          layout: 'centered',
          borderRadius: 'rounded',
          badgeColor: '#ec4899'
        }
      },
      {
        id: 'features-16',
        type: 'features',
        content: {
          headline: 'Where You\'ll Be After This Course',
          subheadline: 'The transformation you can expect',
          features: [
            {
              icon: '🎯',
              title: 'Crystal Clear Direction',
              description: 'Know exactly what to do, when to do it, and why it matters for your success.'
            },
            {
              icon: '💪',
              title: 'Unshakeable Confidence',
              description: 'Master the skills and frameworks that will serve you for years to come.'
            },
            {
              icon: '📈',
              title: 'Measurable Results',
              description: 'See tangible progress toward your goals within the first 30 days.'
            },
            {
              icon: '🌟',
              title: 'Supportive Community',
              description: 'Connect with like-minded achievers who will cheer you on every step of the way.'
            }
          ]
        },
        style: {
          bg: '#f8fafc',
          layout: 'grid-2',
          iconColor: '#3b82f6'
        }
      },
      {
        id: 'features-17',
        type: 'features',
        content: {
          headline: 'Your Learning Journey',
          subheadline: 'Complete course curriculum',
          features: [
            {
              icon: 'Week 1-2',
              title: 'Foundation & Mindset',
              description: 'Build the mental framework and core skills that make everything else possible.'
            },
            {
              icon: 'Week 3-4',
              title: 'Core Strategies',
              description: 'Master the proven techniques that high-achievers use to get consistent results.'
            },
            {
              icon: 'Week 5-6',
              title: 'Advanced Implementation',
              description: 'Take your skills to the next level with advanced frameworks and optimization strategies.'
            },
            {
              icon: 'Week 7-8',
              title: 'Scaling & Momentum',
              description: 'Learn to maintain and accelerate your progress for long-term sustainable success.'
            }
          ]
        },
        style: {
          bg: '#ffffff',
          layout: 'grid-2',
          iconColor: '#8b5cf6'
        }
      },
      {
        id: 'testimonial-3',
        type: 'testimonial',
        content: {
          headline: 'Real People, Real Results',
          quotes: [
            {
              quote: 'This course changed everything for me. I finally have the clarity and confidence I needed. The community support alone was worth the investment!',
              author: 'Emma Williams',
              role: 'Digital Entrepreneur',
              image: '',
              result: 'Achieved first $10k month'
            },
            {
              quote: 'I\'ve taken a lot of courses, but this one actually delivered. The step-by-step guidance made complex concepts easy to implement. Highly recommended!',
              author: 'David Park',
              role: 'Marketing Consultant',
              image: '',
              result: 'Tripled client base in 60 days'
            },
            {
              quote: 'Best decision I made this year. The frameworks are practical, the support is incredible, and the results speak for themselves. Worth every penny!',
              author: 'Lisa Thompson',
              role: 'Course Creator',
              image: '',
              result: 'Launched successful program'
            }
          ]
        },
        style: {
          bg: '#f8fafc',
          layout: 'cards',
          textColor: '#1e293b'
        }
      },
      {
        id: 'features-18',
        type: 'features',
        content: {
          headline: 'Extra Resources to Accelerate Your Progress',
          subheadline: 'Bonus materials included at no additional cost',
          features: [
            {
              icon: '📚',
              title: 'Template Library',
              description: 'Ready-to-use templates and frameworks you can implement immediately.'
            },
            {
              icon: '🎥',
              title: 'Video Tutorials',
              description: 'Clear step-by-step walkthroughs of every concept and strategy.'
            },
            {
              icon: '🤝',
              title: 'Community Access',
              description: 'Join a supportive group of achievers on the same journey as you.'
            },
            {
              icon: '📞',
              title: 'Live Q&A Sessions',
              description: 'Monthly calls where you can get answers and stay motivated.'
            }
          ]
        },
        style: {
          bg: '#ffffff',
          layout: 'grid-2',
          iconColor: '#3b82f6'
        }
      },
      {
        id: 'pricing-3',
        type: 'pricing',
        content: {
          headline: 'Investment in Your Future',
          subheadline: 'Everything you need to succeed, all in one package',
          plans: [
            {
              name: 'Complete Transformation Package',
              price: '$497',
              period: 'one-time',
              features: [
                '✨ All 8 weeks of training',
                '📚 Complete template library',
                '🎥 Lifetime access to all content',
                '🆕 Free updates & new content',
                '🤝 Private community membership',
                '📞 Monthly live Q&A calls',
                '💝 Bonus resources ($200 value)',
                '🎯 30-day success roadmap'
              ],
              cta: 'Start Your Journey',
              highlight: true
            }
          ]
        },
        style: {
          bg: '#f8fafc',
          layout: 'single',
          highlightColor: '#3b82f6'
        }
      },
      {
        id: 'faq-3',
        type: 'faq',
        content: {
          headline: 'Everything You Need to Know',
          subheadline: 'Common questions from future success stories',
          questions: [
            {
              q: 'How quickly will I see results?',
              a: 'Many students report breakthroughs within the first 2 weeks. Full transformation typically happens over the 8-week journey, with skills that last a lifetime.'
            },
            {
              q: 'What if I don\'t have much time?',
              a: 'The program is designed for busy people! Just 1 hour per day is enough to make consistent progress. Go at your own pace - you have lifetime access.'
            },
            {
              q: 'Is there a money-back guarantee?',
              a: 'Absolutely! Try the first 2 weeks risk-free. If you\'re not thrilled with your progress, we\'ll refund every penny. No questions asked.'
            },
            {
              q: 'What makes this different from other courses?',
              a: 'We focus on implementation over information. You\'ll get clear action steps, supportive community, and ongoing guidance - not just videos to watch.'
            },
            {
              q: 'Do I need any special skills or experience?',
              a: 'Not at all! We start with fundamentals and build from there. If you\'re willing to learn and take action, you have everything you need to succeed.'
            }
          ]
        },
        style: {
          bg: '#ffffff',
          layout: 'accordion',
          textColor: '#1e293b'
        }
      },
      {
        id: 'cta-6',
        type: 'cta',
        content: {
          headline: 'Your Transformation Awaits',
          subheadline: 'Join thousands who have already taken the leap and discovered what they\'re truly capable of',
          buttonText: 'Yes, I\'m Ready to Start',
          guarantee: '30-Day 100% Money-Back Guarantee',
          disclaimer: 'Secure payment • Instant access • Lifetime updates included'
        },
        style: {
          bg: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          buttonStyle: 'bright',
          align: 'center',
          buttonColor: '#ffffff'
        }
      }
    ]
  }
]

// =============================================================================
// TEMPLATE EXPORTS
// =============================================================================

export const ALL_TEMPLATES: FunnelTemplate[] = [
  ...GLITCH_TEMPLATES,
  ...ANCHOR_TEMPLATES,
  ...BOOST_TEMPLATES
]

export function getTemplatesByBrandVoice(brandVoice: BrandVoice): FunnelTemplate[] {
  return ALL_TEMPLATES.filter(t => t.brandVoice === brandVoice)
}

export function getTemplatesByCategory(category: TemplateCategory): FunnelTemplate[] {
  return ALL_TEMPLATES.filter(t => t.category === category)
}

export function getTemplateById(id: string): FunnelTemplate | undefined {
  return ALL_TEMPLATES.find(t => t.id === id)
}
