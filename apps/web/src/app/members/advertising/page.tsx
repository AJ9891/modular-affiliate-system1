'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Profile = { plan?: string | null; stripe_subscription_id?: string | null }
const resources = [
  { title: 'I Tested This So You Don’t Have To', file: 'I tested this so you dont have to.png', premium: false },
  { title: 'Why Click?', file: 'PERFECT_WHY_CLICK.png', premium: false },
  { title: 'Money While You Sleep?', file: 'PERFECT_MONEY_BED_SWIM.png', premium: true },
  { title: 'Tired Beach', file: 'PERFECT_ TIRED_BEACH.png', premium: true },
  { title: 'AI Overload', file: 'PERFECT_AI_OVERLOAD.png', premium: true },
]

export default function MembersAdvertisingPage() {
  const [status, setStatus] = useState<'loading' | 'guest' | 'member'>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Not authenticated')
        return response.json()
      })
      .then(data => {
        if (!active) return
        setProfile(data.profile ?? null)
        setStatus('member')
      })
      .catch(() => { if (active) setStatus('guest') })
    return () => { active = false }
  }, [])

  // A plan label alone must never authorize access to paid files.
  // Premium downloads require a separate server-side subscription check.
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 text-slate-900">
      <div className="rounded-3xl bg-slate-950 px-8 py-12 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Launchpad4 Success · Members</p>
        <h1 className="mt-4 text-4xl font-bold">The Advertising Hub</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">Better campaigns, less hype. Explore Glitch creative, advertising resources, and premium membership options.</p>
      </div>

      {status === 'loading' && <p className="mt-8" role="status">Checking your membership…</p>}
      {status === 'guest' && <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-2xl font-bold">Members only</h2>
        <p className="mt-2">Sign in to explore the advertising library.</p>
        <Link className="mt-4 inline-block rounded-lg bg-slate-950 px-5 py-3 text-white" href="/login">Sign in</Link>
      </section>}

      {status === 'member' && <>
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Creative library</h2>
          <p className="mt-2 text-slate-600">Your Glitch campaign collection. Assets will become downloadable after they are uploaded to protected storage and licensed for member use.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map(item => <article key={item.file} className="rounded-2xl border p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-500">{item.premium ? 'Premium · Coming soon' : 'Member creative · Coming soon'}</span>
              <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">Campaign artwork awaiting secure asset publishing.</p>
            </article>)}
          </div>
        </section>
        <section className="mt-10 rounded-2xl border bg-slate-50 p-6">
          <h2 className="text-2xl font-bold">Upgrade your toolkit</h2>
          <p className="mt-2 text-slate-600">Premium creative packs and campaign templates are planned. Checkout will be enabled only after Stripe prices, subscription verification, and webhook provisioning are configured.</p>
          <p className="mt-3 text-sm">Current plan: {profile?.plan || 'Not available'}</p>
        </section>
      </>}

      <aside className="mt-10 rounded-2xl border border-dashed p-6" aria-label="Advertisement">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Advertisement</p>
        <p className="mt-3 text-sm text-slate-600">Advertising placement reserved. No ads are served until an approved provider or direct advertiser is configured.</p>
      </aside>
      <p className="mt-8 text-sm text-slate-500">Advertising revenue and affiliate earnings depend on approved placements, real visitors, and qualifying conversions. No earnings are guaranteed.</p>
    </main>
  )
}
