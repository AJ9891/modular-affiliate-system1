'use client'

import { useState } from 'react'
import { saveNiche } from '@/lib/saveNiche'
import { useRouter } from 'next/navigation'
import { Code, Heart, DollarSign, Dumbbell, GraduationCap, Home } from 'lucide-react'

const NICHES = [
  {
    name: 'Technology & Software',
    icon: Code,
    description: 'SaaS, apps, digital tools, and tech products'
  },
  {
    name: 'Health & Wellness',
    icon: Heart,
    description: 'Fitness, nutrition, supplements, and healthy living'
  },
  {
    name: 'Finance & Business',
    icon: DollarSign,
    description: 'Investing, courses, business tools, and financial services'
  },
  {
    name: 'Fitness & Sports',
    icon: Dumbbell,
    description: 'Workout programs, equipment, and sports gear'
  },
  {
    name: 'Education & Courses',
    icon: GraduationCap,
    description: 'Online learning, coaching, and skill development'
  },
  {
    name: 'Home & Lifestyle',
    icon: Home,
    description: 'Home improvement, decor, and lifestyle products'
  }
]

export default function NicheSelector() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null)

  const handleNicheSelection = async (niche: string) => {
    try {
      setSaving(true)
      setSelectedNiche(niche)
      await saveNiche(niche)
      // Navigate to next step or dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to save niche:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#011936] mb-4">
          Choose Your Niche
        </h1>
        <p className="text-gray-600 text-lg">
          Select the market you want to focus on. You can change this later.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NICHES.map((niche) => {
          const Icon = niche.icon
          const isSelected = selectedNiche === niche.name
          
          return (
            <button
              key={niche.name}
              onClick={() => handleNicheSelection(niche.name)}
              disabled={saving}
              className={`
                p-6 rounded-xl border-2 text-left transition-all
                hover:shadow-lg hover:scale-105
                ${isSelected 
                  ? 'border-[#FF5714] bg-orange-50' 
                  : 'border-gray-200 bg-white hover:border-[#FF5714]'
                }
                ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon 
                className={`mb-4 ${isSelected ? 'text-[#FF5714]' : 'text-[#011936]'}`} 
                size={40} 
              />
              <h3 className="text-xl font-semibold text-[#011936] mb-2">
                {niche.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {niche.description}
              </p>
            </button>
          )
        })}
      </div>

      {saving && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-[#FF5714]">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF5714]"></div>
            <span>Saving your selection...</span>
          </div>
        </div>
      )}
    </div>
  )
}
