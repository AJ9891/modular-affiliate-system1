'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { requireStep } from '@/lib/requireStep'

interface StepGuardProps {
  minStep: number
  redirectTo?: string
  children: React.ReactNode
  loadingComponent?: React.ReactNode
}

export default function StepGuard({ 
  minStep, 
  redirectTo = '/launchpad',
  children,
  loadingComponent 
}: StepGuardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      const allowed = await requireStep(minStep)
      
      if (!allowed) {
        router.push(redirectTo)
      } else {
        setHasAccess(true)
      }
      
      setLoading(false)
    }

    checkAccess()
  }, [minStep, redirectTo, router])

  if (loading) {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5714]"></div>
      </div>
    )
  }

  return hasAccess ? <>{children}</> : null
}
