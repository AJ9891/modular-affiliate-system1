'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface FunnelPreviewDialogProps {
  slug: string
  name?: string
  triggerLabel?: string
  triggerClassName?: string
}

export default function FunnelPreviewDialog({
  slug,
  name,
  triggerLabel = `/${slug}`,
  triggerClassName = 'text-sm text-rocket-400 hover:text-rocket-300',
}: FunnelPreviewDialogProps) {
  const [loaded, setLoaded] = useState(false)

  const previewPath = useMemo(() => `/f/${encodeURIComponent(slug)}`, [slug])
  const title = name?.trim() ? `Preview: ${name}` : `Preview: /${slug}`

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setLoaded(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <button type="button" className={triggerClassName}>
          {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] border-[var(--border-elevated)] bg-[var(--bg-surface)] p-0 text-text-primary sm:max-w-6xl">
        <DialogHeader className="flex-row items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3 text-left">
          <DialogTitle className="text-base text-text-primary">{title}</DialogTitle>
          <a
            href={previewPath}
            target="_blank"
            rel="noreferrer"
            className="mr-8 inline-flex items-center gap-1 text-xs text-rocket-400 hover:text-rocket-300"
          >
            Open in new tab
            <ExternalLink size={12} />
          </a>
        </DialogHeader>

        <div className="relative h-[70vh] w-full">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-surface)] text-sm text-text-secondary">
              Loading funnel preview...
            </div>
          )}
          <iframe
            src={previewPath}
            title={`Funnel preview ${slug}`}
            className="h-full w-full"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
