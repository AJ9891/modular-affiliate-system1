import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Launchpad4Success.pro | AI Funnels That Ship Fast',
  description:
    'Build, launch, and scale affiliate funnels with automation, analytics, and AI support in one control center.',
}

const featureCards = [
  {
    title: 'Funnel Builder',
    description: 'Generate conversion-ready page structure, copy, and offer flow from one mission brief.',
  },
  {
    title: 'Email Autopilot',
    description: 'Launch welcome, nurture, and conversion sequences tied to your funnel stage in minutes.',
  },
  {
    title: 'Performance Radar',
    description: 'See click-through, lead velocity, and conversion signals without spreadsheet cleanup.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    details: 'For testing one funnel and core flow.',
    annual: 'No annual billing',
    bullets: ['1 launchpad', 'Base AI generation', 'Basic analytics'],
  },
  {
    name: 'Starter',
    price: '$29/mo',
    details: 'For solo builders ready to publish consistently.',
    annual: '$278.40/yr (20% off, $23.20/mo effective)',
    bullets: ['3 launchpads', '200 AI generations/month', '500 leads/month'],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$79/mo',
    details: 'For growth operators optimizing every week.',
    annual: '$758.40/yr (20% off, $63.20/mo effective)',
    bullets: ['Unlimited funnels', 'Custom domains + A/B testing', 'Unlimited AI + leads'],
  },
  {
    name: 'Agency',
    price: '$199/mo',
    details: 'For teams managing multiple brands and clients.',
    annual: '$1,910.40/yr (20% off, $159.20/mo effective)',
    bullets: ['Everything in Pro', 'Team collaboration (10 members)', 'White-label + client tools'],
  },
]

export default function HomePage() {
  return (
    <main
      className="relative isolate min-h-screen overflow-hidden px-6 pb-20 pt-6 text-text-primary sm:px-10 lg:px-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_15%,rgba(46,230,194,0.24),transparent_35%),radial-gradient(circle_at_84%_14%,rgba(84,142,255,0.20),transparent_34%),linear-gradient(180deg,#050913_0%,#0b1320_55%,#050913_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl border border-[var(--border-elevated)] bg-[rgba(10,16,24,0.55)] px-4 py-3 backdrop-blur">
        <p className="text-sm tracking-[0.2em] text-rocket-500">
          LAUNCHPAD4SUCCESS.PRO
        </p>
        <div className="flex items-center gap-3 text-sm">
          <Link className="text-text-secondary transition hover:text-text-primary" href="/login">
            Log in
          </Link>
          <Link
            className="rounded-lg bg-rocket-500 px-3 py-2 font-medium text-[#041118] transition hover:bg-rocket-600"
            href="/signup"
          >
            Start free
          </Link>
        </div>
      </header>

      <section className="mx-auto mt-14 grid w-full max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="animate-rise">
          <p className="mb-4 inline-flex rounded-full border border-rocket-500/40 bg-rocket-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-rocket-500">
            Mission Control For Affiliate Growth
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Build your funnel system once. Let it sell on repeat.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-text-secondary">
            Launchpad4Success combines AI generation, conversion-focused structure, email follow-up, and analytics into one cockpit.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/get-started"
              className="rounded-xl bg-[var(--text-primary)] px-6 py-3 font-semibold text-[#06101b] transition hover:translate-y-[-1px]"
            >
              Launch your first funnel
            </Link>
            <Link
              href="/features"
              className="rounded-xl border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.03)] px-6 py-3 font-semibold text-text-primary transition hover:bg-[rgba(255,255,255,0.07)]"
            >
              Explore features
            </Link>
          </div>
        </div>

        <div className="animate-rise-delayed rounded-3xl border border-[var(--border-elevated)] bg-[linear-gradient(150deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] p-6 shadow-2xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.14em] text-text-secondary">Live Snapshot</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(4,9,19,0.6)] p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Lead Conversion</p>
              <p className="mt-1 text-3xl font-semibold text-rocket-500">+31.4%</p>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(4,9,19,0.6)] p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Email Open Rate</p>
              <p className="mt-1 text-3xl font-semibold text-text-primary">48.2%</p>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(4,9,19,0.6)] p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Time To Publish</p>
              <p className="mt-1 text-3xl font-semibold text-text-primary">22 min</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto mt-20 w-full max-w-6xl">
        <h2 className="text-3xl font-semibold sm:text-4xl">Everything needed to ship and scale</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[var(--border-elevated)] bg-[rgba(8,14,24,0.62)] p-6 backdrop-blur transition hover:-translate-y-1 hover:border-rocket-500/45"
            >
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="tiers" className="mx-auto mt-20 w-full max-w-6xl">
        <h2 className="text-3xl font-semibold sm:text-4xl">Choose your launch tier</h2>
        <p className="mt-3 text-text-secondary">Start free, then upgrade when your funnel velocity grows. Annual plans include 20% off.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.highlighted
                  ? 'border-rocket-500/70 bg-[linear-gradient(160deg,rgba(46,230,194,0.18),rgba(8,14,24,0.7))]'
                  : 'border-[var(--border-elevated)] bg-[rgba(8,14,24,0.62)]'
              }`}
            >
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
              <p className="mt-1 text-xs text-rocket-500">{plan.annual}</p>
              <p className="mt-2 text-sm text-text-secondary">{plan.details}</p>
              <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                {plan.bullets.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl rounded-3xl border border-rocket-500/35 bg-[linear-gradient(140deg,rgba(46,230,194,0.14),rgba(8,14,24,0.72))] p-8 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">Ready to deploy your first converting funnel?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
          Open your launchpad, choose your objective, and publish a complete funnel flow with AI guidance.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-rocket-500 px-6 py-3 font-semibold text-[#041118] transition hover:bg-rocket-600"
          >
            Create account
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.03)] px-6 py-3 font-semibold text-text-primary transition hover:bg-[rgba(255,255,255,0.08)]"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
