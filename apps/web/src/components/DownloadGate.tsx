'use client';

import React, { useState } from 'react';
import { Download, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface DownloadGateProps {
  downloadId: string;
  title?: string;
  description?: string;
  buttonText?: string;
  funnelId?: string;
}

export default function DownloadGate({
  downloadId,
  title = "Get Your Free Download",
  description = "Enter your email to receive instant access",
  buttonText = "Download Now",
  funnelId
}: DownloadGateProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build download URL with email and funnel tracking
      const downloadUrl = `/api/downloads/${downloadId}?email=${encodeURIComponent(email)}${funnelId ? `&funnelId=${funnelId}` : ''}`;
      
      // Trigger download
      window.location.href = downloadUrl;
      
      setSuccess(true);
      setEmail('');

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err: any) {
      setError(err.message || 'Failed to start download');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-8 bg-green-50 border-2 border-green-200 rounded-lg">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-2xl font-bold text-green-900 mb-2">Download Started!</h3>
          <p className="text-green-800">
            Your download should start automatically. Check your downloads folder.
          </p>
          <p className="text-sm text-green-700 mt-4">
            We've also sent a copy to your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <Download className="w-12 h-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              Starting Download...
            </span>
          ) : (
            buttonText
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By downloading, you agree to receive occasional emails. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
