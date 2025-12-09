'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function ConditionalWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  // Don't add margin on homepage, login, signup, or pricing pages
  const noMarginOn = ['/', '/login', '/signup', '/pricing', '/features', '/get-started']
  
  const shouldAddMargin = !noMarginOn.includes(pathname)
  
  if (shouldAddMargin) {
    return (
      <div className="transition-all duration-300 lg:ml-64 min-h-screen">
        {children}
      </div>
    )
  }
  
  return <>{children}</>
}
