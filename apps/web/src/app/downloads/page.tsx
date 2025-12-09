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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Magnets & Downloads</h1>
          <p className="text-gray-600">
            Upload ebooks, PDFs, and digital products to use as lead magnets in your funnels
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <UploadManager onUploadComplete={handleUploadComplete} />
        </div>

        {/* Downloads List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Downloads</h2>
            <p className="text-sm text-gray-500 mt-1">
              {downloads.length} file{downloads.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading downloads...</p>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          ) : downloads.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads yet</h3>
              <p className="text-gray-500">Upload your first lead magnet above to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {downloads.map((download) => (
                <div key={download.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-gray-900">{download.title}</h3>
                        {download.is_active ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            Inactive
                          </span>
                        )}
                      </div>

                      {download.description && (
                        <p className="text-gray-600 mb-3">{download.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📁 {download.file_name}</span>
                        <span>💾 {formatFileSize(download.file_size)}</span>
                        <span>⬇️ {download.download_count} downloads</span>
                        <span>📅 {formatDate(download.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => copyDownloadLink(download.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copy download link"
                      >
                        {copiedId === download.id ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>

                      <a
                        href={download.storage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View file"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>

                      <button
                        onClick={() => handleDelete(download.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Download Link Info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Download Link (click copy button above):</p>
                    <code className="text-xs text-gray-700 break-all">
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
