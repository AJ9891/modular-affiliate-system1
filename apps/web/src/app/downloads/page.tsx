'use client';

import React, { useState, useEffect } from 'react';
import { Download, Trash2, Copy, ExternalLink, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import UploadManager from '@/components/UploadManager';

interface DownloadItem {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_url: string;
  download_count: number;
  is_active: boolean;
  created_at: string;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/uploads');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch downloads');
      }

      setDownloads(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const handleUploadComplete = (newDownload: DownloadItem) => {
    setDownloads(prev => [newDownload, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/uploads?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete file');
      }

      setDownloads(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete file');
    }
  };

  const copyDownloadLink = (id: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/api/downloads/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="cockpit-shell page-cargo-bay py-8">
      <div className="cockpit-container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold text-text-primary">Cargo Bay</h1>
          <p className="text-text-secondary">
            Upload ebooks, PDFs, and digital products to use as lead magnets in your funnels
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <UploadManager onUploadComplete={handleUploadComplete} />
        </div>

        {/* Downloads List */}
        <div className="hud-card">
          <div className="border-b border-[var(--border-subtle)] px-6 py-4">
            <h2 className="text-xl font-semibold text-text-primary">Cargo Manifest</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {downloads.length} file{downloads.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-rocket-500"></div>
              <p className="mt-4 text-text-secondary">Loading cargo...</p>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          ) : downloads.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-text-muted" />
              <h3 className="mb-2 text-lg font-medium text-text-primary">No cargo loaded</h3>
              <p className="text-text-secondary">Upload your first lead magnet above to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {downloads.map((download) => (
                <div key={download.id} className="p-6 transition hover:bg-[rgba(255,255,255,0.03)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 flex-shrink-0 text-rocket-500" />
                        <h3 className="text-lg font-semibold text-text-primary">{download.title}</h3>
                        {download.is_active ? (
                          <span className="rounded px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="rounded px-2 py-1 text-xs font-medium bg-slate-500/20 text-slate-200">
                            Inactive
                          </span>
                        )}
                      </div>

                      {download.description && (
                        <p className="mb-3 text-text-secondary">{download.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                        <span>📁 {download.file_name}</span>
                        <span>💾 {formatFileSize(download.file_size)}</span>
                        <span>⬇️ {download.download_count} downloads</span>
                        <span>📅 {formatDate(download.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => copyDownloadLink(download.id)}
                        className="rounded-lg p-2 text-text-secondary transition hover:bg-[rgba(46,230,194,0.14)] hover:text-rocket-500"
                        title="Copy download link"
                      >
                        {copiedId === download.id ? (
                          <CheckCircle className="h-5 w-5 text-emerald-300" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>

                      <a
                        href={download.storage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-text-secondary transition hover:bg-[rgba(46,230,194,0.14)] hover:text-rocket-500"
                        title="View file"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>

                      <button
                        onClick={() => handleDelete(download.id)}
                        className="rounded-lg p-2 text-text-secondary transition hover:bg-red-500/20 hover:text-red-300"
                        title="Delete file"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Download Link Info */}
                  <div className="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[rgba(10,16,24,0.55)] p-3">
                    <p className="mb-1 text-xs text-text-muted">Download Link (copy from action icon):</p>
                    <code className="break-all text-xs text-text-secondary">
                      {window.location.origin}/api/downloads/{download.id}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
