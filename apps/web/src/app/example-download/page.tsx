'use client';

import React from 'react';
import DownloadGate from '@/components/DownloadGate';

export default function ExampleDownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Get Your Free SEO Checklist
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Download our comprehensive 50-point SEO checklist and start ranking higher today
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">50 Action Items</h3>
            <p className="text-gray-600 text-sm">
              Complete checklist covering on-page, off-page, and technical SEO
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy to Follow</h3>
            <p className="text-gray-600 text-sm">
              Step-by-step guidance with practical examples
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900 mb-2">Proven Results</h3>
            <p className="text-gray-600 text-sm">
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
          <p className="text-gray-600 mb-4">Trusted by marketers at:</p>
          <div className="flex justify-center gap-8 text-gray-400">
            <span className="font-semibold">Google</span>
            <span className="font-semibold">Amazon</span>
            <span className="font-semibold">Microsoft</span>
            <span className="font-semibold">Meta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
