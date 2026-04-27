'use client';

import React from 'react';
import DownloadGate from '@/components/DownloadGate';

export default function ExampleDownloadPage() {
  return (
    <main className="cockpit-container min-h-screen py-12">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="mb-4 text-5xl font-bold text-text-primary heading-premium">
            Get Your Free SEO Checklist
          </h1>
          <p className="mb-8 text-xl text-text-secondary">
            Download our comprehensive 50-point SEO checklist and start ranking higher today
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card-premium rounded-lg p-6">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="mb-2 font-semibold text-text-primary">50 Action Items</h3>
            <p className="text-sm text-text-secondary">
              Complete checklist covering on-page, off-page, and technical SEO
            </p>
          </div>
          <div className="card-premium rounded-lg p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="mb-2 font-semibold text-text-primary">Easy to Follow</h3>
            <p className="text-sm text-text-secondary">
              Step-by-step guidance with practical examples
            </p>
          </div>
          <div className="card-premium rounded-lg p-6">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="mb-2 font-semibold text-text-primary">Proven Results</h3>
            <p className="text-sm text-text-secondary">
              Used by 10,000+ marketers to improve their rankings
            </p>
          </div>
        </div>

        {/* Download Gate Component */}
        <DownloadGate
          downloadId="example-seo-checklist"
          title="Get Your Free SEO Checklist"
          description="Enter your email to receive instant access to the checklist"
          buttonText="Download Free Checklist"
          funnelId="example-seo-funnel"
        />

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-text-secondary">Trusted by marketers at:</p>
          <div className="flex justify-center gap-8 text-text-muted">
            <span className="font-semibold">Google</span>
            <span className="font-semibold">Amazon</span>
            <span className="font-semibold">Microsoft</span>
            <span className="font-semibold">Meta</span>
          </div>
        </div>
      </div>
    </main>
  )
}
