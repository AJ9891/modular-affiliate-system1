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
    <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          © 2025 Launchpad 4 Success · An independent marketing platform by Abbigal Jurek
        </p>
      </div>
    </footer>
  )
}
