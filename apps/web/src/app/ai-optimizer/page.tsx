'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AIOptimizationDashboard } from '@/components/optimization/AIOptimizationDashboard'
import { Brain, ArrowLeft, Target, Zap } from 'lucide-react'

interface UserFunnel {
  id: string
  name: string
  blocks: any
  created_at: string
  active: boolean
  leads_count?: number
  clicks_count?: number
}

export default function AIOptimizerPage() {
  const router = useRouter()
  const [funnels, setFunnels] = useState<UserFunnel[]>([])
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUserAndFunnels()
  }, [])

  const loadUserAndFunnels = async () => {
    try {
      // Check authentication
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        router.push('/login')
        return
      }

      setUser(authUser)

      // Load user's funnels with basic stats
      const { data: funnelsData, error: funnelsError } = await supabase
        .from('funnels')
        .select(`
          id,
          name,
          blocks,
          created_at,
          active,
          leads:leads(count),
          clicks:clicks(count)
        `)
        .eq('user_id', authUser.id)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (funnelsError) {
        console.error('Error loading funnels:', funnelsError)
        return
      }

      const processedFunnels = (funnelsData || []).map((funnel: any) => ({
        ...funnel,
        leads_count: funnel.leads?.[0]?.count || 0,
        clicks_count: funnel.clicks?.[0]?.count || 0
      }))

      setFunnels(processedFunnels)
      
      // Auto-select the first funnel if available
      if (processedFunnels.length > 0) {
        setSelectedFunnelId(processedFunnels[0].id)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedFunnel = funnels.find(f => f.id === selectedFunnelId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Optimizer...</p>
        </div>
      </div>
    )
  }

  if (funnels.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="h-8 w-8 text-purple-600" />
                AI Optimizer
              </h1>
              <p className="text-gray-600">Boost your funnel performance with AI-powered suggestions</p>
            </div>
          </div>

          {/* No Funnels State */}
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-16">
              <Target className="h-16 w-16 mx-auto mb-6 text-gray-400" />
              <h2 className="text-2xl font-semibold mb-4">No Active Funnels Found</h2>
              <p className="text-gray-600 mb-8">
                You need at least one active funnel to use the AI Optimizer. 
                Create a funnel first to get personalized optimization suggestions.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/visual-builder')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Create Funnel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/launchpad')}
                >
                  Back to Launchpad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="h-8 w-8 text-purple-600" />
                AI Optimizer
              </h1>
              <p className="text-gray-600">Boost your funnel performance with AI-powered suggestions</p>
            </div>
          </div>

          {/* Funnel Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Funnel:</label>
            <Select value={selectedFunnelId} onValueChange={setSelectedFunnelId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose a funnel to optimize" />
              </SelectTrigger>
              <SelectContent>
                {funnels.map((funnel) => (
                  <SelectItem key={funnel.id} value={funnel.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{funnel.name}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
                        <span>{funnel.leads_count || 0} leads</span>
                        <span>•</span>
                        <span>{funnel.clicks_count || 0} clicks</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Optimization Dashboard */}
        {selectedFunnel && (
          <AIOptimizationDashboard 
            funnelId={selectedFunnel.id}
            funnelName={selectedFunnel.name}
          />
        )}

        {!selectedFunnelId && funnels.length > 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Brain className="h-16 w-16 mx-auto mb-6 text-purple-400" />
              <h2 className="text-xl font-semibold mb-4">Select a Funnel to Optimize</h2>
              <p className="text-gray-600">
                Choose a funnel from the dropdown above to start analyzing and optimizing its performance.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Our AI analyzes your funnel performance data and identifies optimization opportunities 
                based on industry best practices and your brand personality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Auto-Optimize
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Apply AI suggestions with one click, or generate A/B test variations to validate 
                improvements before making changes to your live funnels.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Performance Boost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Based on your BrandBrain personality, our AI generates suggestions that can 
                improve conversion rates by 10-35% while staying true to your brand voice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}