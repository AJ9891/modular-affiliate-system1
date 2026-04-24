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
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto" aria-label="Site footer">
      <div className="container mx-auto px-4 text-center space-y-3">
        <p className="text-sm">
          © {new Date().getFullYear()} Launchpad4Success.pro · An independent marketing platform by Abbigal Jurek
        </p>
        <p className="text-xs text-gray-400 max-w-3xl mx-auto">
          Launchpad4Success.pro publishes practical affiliate marketing systems, funnel strategy, conversion optimization guidance, and email automation workflows for creators and digital businesses.
        </p>
        <nav aria-label="Footer links" className="text-xs text-gray-400 flex items-center justify-center gap-4 flex-wrap">
          <a href="/about" className="hover:text-white transition-colors">About</a>
          <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="/features" className="hover:text-white transition-colors">Features</a>
        </nav>
      </div>
    </footer>
  )
}
