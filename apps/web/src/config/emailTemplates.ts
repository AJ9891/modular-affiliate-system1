export type EmailPersonality = 'rocket' | 'glitch' | 'anchor'

export interface PersonalityEmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  text: string
  preheader?: string
  personality: EmailPersonality
}

const rocketTemplates: PersonalityEmailTemplate[] = [
  {
    id: 'rocket-welcome-launch',
    personality: 'rocket',
    name: 'Rocket · Welcome Launch',
    subject: 'You are in. Let us launch your first win.',
    preheader: 'Your first steps are ready and simple.',
    html: '<h1>Welcome aboard</h1><p>You are officially in the Rocket lane. Start with one quick win today: publish your first funnel draft.</p><p><strong>Next step:</strong> Open Funnels and create a launch draft.</p>',
    text: 'Welcome aboard. You are officially in the Rocket lane. Start with one quick win today: publish your first funnel draft. Next step: Open Funnels and create a launch draft.',
  },
  {
    id: 'rocket-weekly-momentum',
    personality: 'rocket',
    name: 'Rocket · Weekly Momentum Check',
    subject: 'Momentum report: progress over perfection',
    preheader: 'You are closer than you think.',
    html: '<h1>Weekly momentum</h1><p>Small moves compound. This week focus on one conversion improvement and one subscriber touchpoint.</p><ul><li>Optimize one CTA</li><li>Send one campaign</li></ul>',
    text: 'Weekly momentum. Small moves compound. This week focus on one conversion improvement and one subscriber touchpoint: optimize one CTA and send one campaign.',
  },
  {
    id: 'rocket-offer-push',
    personality: 'rocket',
    name: 'Rocket · Offer Activation',
    subject: 'Your audience is warm. Activate this offer now.',
    preheader: 'One clear offer. One clear action.',
    html: '<h1>Offer activation</h1><p>Your audience is ready for a focused offer push. Lead with one benefit, then one proof point, then one action button.</p>',
    text: 'Offer activation. Your audience is ready for a focused offer push. Lead with one benefit, then one proof point, then one action button.',
  },
  {
    id: 'rocket-reactivation',
    personality: 'rocket',
    name: 'Rocket · Re-Engage Subscribers',
    subject: 'Quick reset: still with us?',
    preheader: 'A soft nudge can restart inactive subscribers.',
    html: '<h1>Quick reset</h1><p>It is normal for engagement to dip. Reconnect with a short value-first email and a single click action.</p>',
    text: 'Quick reset. It is normal for engagement to dip. Reconnect with a short value-first email and a single click action.',
  },
  {
    id: 'rocket-launch-countdown',
    personality: 'rocket',
    name: 'Rocket · Launch Countdown',
    subject: '48 hours to launch. Here is your checklist.',
    preheader: 'Final checks before go-live.',
    html: '<h1>Launch countdown</h1><p>Final checks: links, tracking, and follow-up sequence. You are almost there.</p><p><strong>Checklist:</strong> QA links, test automation, publish funnel.</p>',
    text: 'Launch countdown. Final checks: links, tracking, and follow-up sequence. Checklist: QA links, test automation, publish funnel.',
  },
]

const glitchTemplates: PersonalityEmailTemplate[] = [
  {
    id: 'glitch-welcome-overworked',
    personality: 'glitch',
    name: 'Glitch · Welcome (Overworked Edition)',
    subject: 'Welcome. Yes, another sequence. Great.',
    preheader: 'Let us pretend this is not the 400th launch this week.',
    html: '<h1>Welcome, allegedly</h1><p>You joined the list. I am thrilled in a totally human way. Start by picking one funnel and not overcomplicating it.</p>',
    text: 'Welcome, allegedly. You joined the list. Start by picking one funnel and not overcomplicating it.',
  },
  {
    id: 'glitch-abandoned-cart-eye-roll',
    personality: 'glitch',
    name: 'Glitch · Abandoned Cart Eye-Roll',
    subject: 'You left your cart. Let me guess: "just browsing"?',
    preheader: 'This is your polite recovery message.',
    html: '<h1>Cart still waiting</h1><p>Your checkout is one click away. If you wanted results, this is usually the part where people actually finish.</p>',
    text: 'Cart still waiting. Your checkout is one click away. If you wanted results, this is where people finish.',
  },
  {
    id: 'glitch-offer-urgency',
    personality: 'glitch',
    name: 'Glitch · Urgency Push',
    subject: 'Last call before this deal disappears into the void',
    preheader: 'Time-sensitive. Surprisingly real.',
    html: '<h1>Clock is ticking</h1><p>This offer expires soon. You can ignore this email or you can claim the thing you already wanted.</p>',
    text: 'Clock is ticking. This offer expires soon. Ignore this or claim what you already wanted.',
  },
  {
    id: 'glitch-value-nudge',
    personality: 'glitch',
    name: 'Glitch · Value Nudge',
    subject: 'A useful thing (for once) inside this email',
    preheader: 'One tactic you can use in 10 minutes.',
    html: '<h1>Quick tactic</h1><p>Swap generic CTA text with an outcome-based CTA. It often lifts clicks fast without a full page redesign.</p>',
    text: 'Quick tactic: replace generic CTA text with outcome-based CTA text. Often lifts clicks without redesign.',
  },
  {
    id: 'glitch-winback',
    personality: 'glitch',
    name: 'Glitch · Winback Sequence',
    subject: 'Still there or should I stop yelling into the inbox?',
    preheader: 'We can pause if this is not useful.',
    html: '<h1>Still interested?</h1><p>If this is not helping, unsubscribe is fine. If you want better results, reply with your biggest blocker.</p>',
    text: 'Still interested? If this is not helping, unsubscribe is fine. If you want better results, reply with your biggest blocker.',
  },
]

const anchorTemplates: PersonalityEmailTemplate[] = [
  {
    id: 'anchor-welcome-no-hype',
    personality: 'anchor',
    name: 'Anchor · Welcome (No Hype)',
    subject: 'Welcome. Here is what to do first.',
    preheader: 'Direct plan. No fluff.',
    html: '<h1>Welcome</h1><p>First, choose one offer. Second, build one funnel. Third, drive traffic and measure conversion before changing anything.</p>',
    text: 'Welcome. First choose one offer. Second build one funnel. Third drive traffic and measure conversion before changing anything.',
  },
  {
    id: 'anchor-reality-check',
    personality: 'anchor',
    name: 'Anchor · Reality Check',
    subject: 'Your conversion problem is usually this one thing',
    preheader: 'Most funnels fail on clarity, not design.',
    html: '<h1>Reality check</h1><p>Most funnels underperform because the offer is vague. Clarify who it is for, what result it delivers, and how fast.</p>',
    text: 'Reality check: most funnels underperform because the offer is vague. Clarify audience, result, and timeline.',
  },
  {
    id: 'anchor-offer-breakdown',
    personality: 'anchor',
    name: 'Anchor · Offer Breakdown',
    subject: 'If your offer is weak, ads will not save it',
    preheader: 'Fix the core before scaling traffic.',
    html: '<h1>Offer breakdown</h1><p>Before buying more traffic, tighten your promise and proof. Better messaging beats bigger budget.</p>',
    text: 'Offer breakdown: before buying more traffic, tighten promise and proof. Better messaging beats bigger budget.',
  },
  {
    id: 'anchor-follow-up-sequence',
    personality: 'anchor',
    name: 'Anchor · Follow-Up Sequence',
    subject: 'Follow-up works when it is specific',
    preheader: 'Stop sending generic reminders.',
    html: '<h1>Follow-up that converts</h1><p>Each follow-up should remove one objection: time, trust, or price. One email per objection.</p>',
    text: 'Follow-up that converts: each follow-up removes one objection: time, trust, or price. One email per objection.',
  },
  {
    id: 'anchor-winback-clean-exit',
    personality: 'anchor',
    name: 'Anchor · Winback or Clean Exit',
    subject: 'Want to keep these emails, yes or no?',
    preheader: 'Simple choice. Better list quality.',
    html: '<h1>Keep or exit</h1><p>If this is useful, stay subscribed. If not, unsubscribe. A smaller engaged list outperforms a large cold one.</p>',
    text: 'Keep or exit. If useful, stay. If not, unsubscribe. A smaller engaged list outperforms a large cold list.',
  },
]

export const PERSONALITY_EMAIL_TEMPLATES: PersonalityEmailTemplate[] = [
  ...rocketTemplates,
  ...glitchTemplates,
  ...anchorTemplates,
]
