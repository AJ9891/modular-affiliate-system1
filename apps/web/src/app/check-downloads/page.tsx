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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking downloads system setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Downloads System Status
            </h1>
            <p className="text-gray-600">
              Verification of database tables and storage setup
            </p>
          </div>

          {/* Overall Status */}
          <div className={`p-6 rounded-lg mb-6 ${
            result?.success 
              ? 'bg-green-50 border-2 border-green-200' 
              : 'bg-yellow-50 border-2 border-yellow-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {result?.success ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              )}
              <h2 className={`text-xl font-bold ${
                result?.success ? 'text-green-900' : 'text-yellow-900'
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-900 mb-2">Errors Found:</h3>
              <ul className="space-y-1">
                {result.errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-800">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {!result?.success && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">📝 Setup Instructions:</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li>1. Open your <strong>Supabase Dashboard</strong></li>
                <li>2. Go to <strong>SQL Editor</strong></li>
                <li>3. Copy the SQL from <code className="bg-blue-100 px-2 py-1 rounded">DOWNLOADS_SETUP.md</code></li>
                <li>4. Paste and run in SQL Editor</li>
                <li>5. Go to <strong>Storage</strong> → Create bucket <code className="bg-blue-100 px-2 py-1 rounded">downloads</code> (Public)</li>
                <li>6. Refresh this page to verify</li>
              </ol>
            </div>
          )}

          {result?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3">🎉 You're all set! Next steps:</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>✅ Visit <a href="/downloads" className="font-semibold underline">/downloads</a> to upload your first file</li>
                <li>✅ Check <a href="/example-download" className="font-semibold underline">/example-download</a> to see it in action</li>
                <li>✅ Add <code className="bg-green-100 px-2 py-1 rounded">DownloadGate</code> component to your funnels</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Check Again
            </button>
            {result?.success && (
              <a
                href="/downloads"
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Go to Downloads
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, status, description }: { label: string; status: boolean; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
      {status ? (
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{label}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        status 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status ? 'Ready' : 'Missing'}
      </span>
    </div>
  );
}
