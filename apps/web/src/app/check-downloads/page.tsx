'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface CheckResult {
  success: boolean;
  downloads_table: boolean;
  download_logs_table: boolean;
  storage_bucket: boolean;
  errors: string[];
  message: string;
}

export default function CheckDownloadsPage() {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch('/api/check-downloads');
        const data = await response.json();
        setResult(data);
      } catch (error) {
        setResult({
          success: false,
          downloads_table: false,
          download_logs_table: false,
          storage_bucket: false,
          errors: ['Failed to check setup'],
          message: 'Error checking setup'
        });
      } finally {
        setLoading(false);
      }
    }
    checkSetup();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-rocket-500" />
          <p className="text-text-secondary">Checking downloads system setup...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="cockpit-container min-h-screen py-12">
      <div className="mx-auto max-w-3xl">
        <div className="card-premium rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="mb-2 text-3xl font-bold text-text-primary">
              Downloads System Status
            </h1>
            <p className="text-text-secondary">
              Verification of database tables and storage setup
            </p>
          </div>

          {/* Overall Status */}
          <div className={`p-6 rounded-lg mb-6 ${
            result?.success 
              ? 'border-2 border-emerald-400/35 bg-emerald-500/10' 
              : 'border-2 border-amber-400/35 bg-amber-500/10'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {result?.success ? (
                <CheckCircle className="h-8 w-8 text-emerald-300" />
              ) : (
                <AlertCircle className="h-8 w-8 text-amber-300" />
              )}
              <h2 className={`text-xl font-bold ${
                result?.success ? 'text-emerald-100' : 'text-amber-100'
              }`}>
                {result?.message}
              </h2>
            </div>
          </div>

          {/* Component Checks */}
          <div className="space-y-4 mb-8">
            <CheckItem
              label="downloads table"
              status={result?.downloads_table || false}
              description="Stores file metadata and information"
            />
            <CheckItem
              label="download_logs table"
              status={result?.download_logs_table || false}
              description="Tracks download activity and leads"
            />
            <CheckItem
              label="downloads storage bucket"
              status={result?.storage_bucket || false}
              description="Stores actual files in Supabase Storage"
            />
          </div>

          {/* Errors */}
          {result?.errors && result.errors.length > 0 && (
            <div className="mb-6 rounded-lg border border-red-400/35 bg-red-500/10 p-4">
              <h3 className="mb-2 font-semibold text-red-100">Errors Found:</h3>
              <ul className="space-y-1">
                {result.errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-200">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {!result?.success && (
            <div className="rounded-lg border border-sky-400/35 bg-sky-500/10 p-6">
              <h3 className="mb-3 font-semibold text-sky-100">📝 Setup Instructions:</h3>
              <ol className="space-y-2 text-sm text-sky-200">
                <li>1. Open your <strong>Supabase Dashboard</strong></li>
                <li>2. Go to <strong>SQL Editor</strong></li>
                <li>3. Copy the SQL from <code className="rounded bg-sky-300/20 px-2 py-1">DOWNLOADS_SETUP.md</code></li>
                <li>4. Paste and run in SQL Editor</li>
                <li>5. Go to <strong>Storage</strong> → Create bucket <code className="rounded bg-sky-300/20 px-2 py-1">downloads</code> (Public)</li>
                <li>6. Refresh this page to verify</li>
              </ol>
            </div>
          )}

          {result?.success && (
            <div className="rounded-lg border border-emerald-400/35 bg-emerald-500/10 p-6">
              <h3 className="mb-3 font-semibold text-emerald-100">🎉 You're all set! Next steps:</h3>
              <ul className="space-y-2 text-sm text-emerald-200">
                <li>✅ Visit <a href="/downloads" className="font-semibold underline">/downloads</a> to upload your first file</li>
                <li>✅ Check <a href="/example-download" className="font-semibold underline">/example-download</a> to see it in action</li>
                <li>✅ Add <code className="rounded bg-emerald-300/20 px-2 py-1">DownloadGate</code> component to your funnels</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="hud-button-secondary flex-1 px-4 py-2"
            >
              Check Again
            </button>
            {result?.success && (
              <a
                href="/downloads"
                className="btn-launch-premium flex-1 px-4 py-2 text-center"
              >
                Go to Downloads
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function CheckItem({ label, status, description }: { label: string; status: boolean; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] p-4">
      {status ? (
        <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-300" />
      ) : (
        <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-300" />
      )}
      <div className="flex-1">
        <h4 className="font-semibold text-text-primary">{label}</h4>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        status 
          ? 'bg-emerald-500/20 text-emerald-100' 
          : 'bg-red-500/20 text-red-100'
      }`}>
        {status ? 'Ready' : 'Missing'}
      </span>
    </div>
  )
}
