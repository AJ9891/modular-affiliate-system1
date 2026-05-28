'use client'

import React from 'react'
import { AlertCircle, TrendingUp, Target, Zap } from 'lucide-react'

export default function TrafficEducationPanel() {
  return (
    <div className="mb-8 rounded-2xl border border-rocket-500/40 bg-[rgba(46,230,194,0.08)] p-6 md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <AlertCircle className="text-rocket-500" size={24} />
        <h2 className="text-xl font-semibold text-text-primary">Why Traffic Matters</h2>
      </div>

      <p className="mb-6 text-sm text-text-secondary leading-relaxed">
        Your funnel is the engine — but traffic is the fuel. Without visitors, there are no leads, no conversions, and no revenue. The best-optimized funnel still needs people to see it.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rocket-500/20 px-2 py-1">
            <Target size={14} className="text-rocket-500" />
            <span className="text-xs font-semibold text-rocket-500">Step 1</span>
          </div>
          <h3 className="mt-2 font-semibold text-text-primary">Acquire Traffic</h3>
          <p className="mt-2 text-xs text-text-secondary">
            Direct people to your funnel via paid ads, organic search, email, social media, or partnerships.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-2 py-1">
            <Zap size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-500">Step 2</span>
          </div>
          <h3 className="mt-2 font-semibold text-text-primary">Convert Visitors</h3>
          <p className="mt-2 text-xs text-text-secondary">
            Your funnel captures leads and buyers. Better copy, design, and flow = higher conversion rates.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-2 py-1">
            <TrendingUp size={14} className="text-cyan-500" />
            <span className="text-xs font-semibold text-cyan-500">Step 3</span>
          </div>
          <h3 className="mt-2 font-semibold text-text-primary">Scale Wins</h3>
          <p className="mt-2 text-xs text-text-secondary">
            Once you have proof, scale the traffic that works. The platform optimizes your keywords and offers.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-[rgba(46,230,194,0.1)] p-4">
        <h4 className="text-sm font-semibold text-text-primary">How Launchpad Helps</h4>
        <ul className="mt-3 space-y-2 text-xs text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-rocket-500">✓</span>
            <span><strong>Track every visitor:</strong> UTM parameters and pixel tracking show where traffic comes from.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rocket-500">✓</span>
            <span><strong>Optimize automatically:</strong> AI learns which copy, design, and offers perform best with your traffic.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rocket-500">✓</span>
            <span><strong>Real-time dashboards:</strong> See click-through rates, lead velocity, and conversion signals instantly.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rocket-500">✓</span>
            <span><strong>Smart scaling:</strong> The platform recommends which traffic sources and keywords to double down on.</span>
          </li>
        </ul>
      </div>

      <p className="mt-4 text-xs text-text-secondary italic">
        Your job: bring traffic. Launchpad's job: convert it and scale it. Together, you grow.
      </p>
    </div>
  )
}
