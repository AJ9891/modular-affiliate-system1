'use client'

import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // Don't show footer on pages with custom footers
  const hideFooterOn = ['/do_not_click']

  if (hideFooterOn.includes(pathname)) {
    return null
  }

  return (
    <footer className="relative mt-auto border-t border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(4,8,14,0.15),rgba(4,8,14,0.55))] py-6 text-text-secondary backdrop-blur-xl">
      <div className="cockpit-container text-center">
        <p className="text-sm tracking-wide">
          © 2025 Launchpad 4 Success · An independent marketing platform by Abbigal Jurek
        </p>
      </div>
    </footer>
  )
}
