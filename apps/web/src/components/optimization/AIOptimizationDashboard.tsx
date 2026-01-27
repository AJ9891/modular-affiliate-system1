import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAIOptimizer } from '@/hooks/useAIOptimizer'
import { 
  TrendingUp, 
  Brain, 
  Zap, 
  Target, 
  BarChart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Sparkles,
  TestTube,
  History
} from 'lucide-react'

interface AIOptimizationDashboardProps {
  funnelId: string
  funnelName?: string
}

export function AIOptimizationDashboard({ funnelId, funnelName }: AIOptimizationDashboardProps) {
  const {
    loading,
    suggestions,
    abTestVariations,
    optimizationHistory,
    analyzeFunnel,
    autoOptimizeBlock,
    generateABTest,
    getOptimizationHistory,
    applySuggestion,
    dismissSuggestion,
    highImpactSuggestions,
    mediumImpactSuggestions,
    lowImpactSuggestions,
    totalPotentialLift,
    averageConfidence
  } = useAIOptimizer()

  const [activeTab, setActiveTab] = useState('suggestions')
  const [analysisDate, setAnalysisDate] = useState<Date | null>(null)

  useEffect(() => {
    if (funnelId) {
      analyzeFunnel(funnelId)
      getOptimizationHistory(funnelId)
    }
  }, [funnelId])

  const handleAnalyze = async () => {
    await analyzeFunnel(funnelId)
    setAnalysisDate(new Date())
  }

  const handleAutoOptimize = async (blockId: string) => {
    await autoOptimizeBlock(funnelId, blockId)
    // Refresh data
    await analyzeFunnel(funnelId)
    await getOptimizationHistory(funnelId)
  }

  const handleGenerateABTest = async (blockId: string, testType: 'headline' | 'cta' | 'copy' | 'style') => {
    await generateABTest(funnelId, blockId, testType)
  }

  const getImpactColor = (lift: number) => {
    if (lift >= 20) return 'text-green-600 bg-green-50 border-green-200'
    if (lift >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Optimization Dashboard
          </h2>
          <p className="text-muted-foreground">
            {funnelName ? `Optimizing "${funnelName}"` : 'Funnel optimization powered by AI'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAnalyze} disabled={loading} variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Re-analyze
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Suggestions</p>
                <p className="text-2xl font-bold">{suggestions.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential Lift</p>
                <p className="text-2xl font-bold text-green-600">+{totalPotentialLift.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Impact</p>
                <p className="text-2xl font-bold text-orange-600">{highImpactSuggestions.length}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{(averageConfidence * 100).toFixed(0)}%</p>
              </div>
              <BarChart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Suggestions Available</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Re-analyze" to generate AI-powered optimization suggestions for your funnel.
                </p>
                <Button onClick={handleAnalyze} disabled={loading}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* High Impact Suggestions */}
              {highImpactSuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-600" />
                      High Impact Suggestions
                    </CardTitle>
                    <CardDescription>
                      These optimizations could significantly improve your funnel performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {highImpactSuggestions.map((suggestion, index) => (
                      <SuggestionCard
                        key={index}
                        suggestion={suggestion}
                        onApply={() => applySuggestion(funnelId, suggestion)}
                        onDismiss={() => dismissSuggestion(suggestion.blockId, suggestion.field)}
                        onGenerateABTest={(testType) => handleGenerateABTest(suggestion.blockId, testType)}
                        loading={loading}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Medium Impact Suggestions */}
              {mediumImpactSuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-yellow-600" />
                      Medium Impact Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mediumImpactSuggestions.map((suggestion, index) => (
                      <SuggestionCard
                        key={index}
                        suggestion={suggestion}
                        onApply={() => applySuggestion(funnelId, suggestion)}
                        onDismiss={() => dismissSuggestion(suggestion.blockId, suggestion.field)}
                        onGenerateABTest={(testType) => handleGenerateABTest(suggestion.blockId, testType)}
                        loading={loading}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Low Impact Suggestions */}
              {lowImpactSuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-blue-600" />
                      Low Impact Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lowImpactSuggestions.map((suggestion, index) => (
                      <SuggestionCard
                        key={index}
                        suggestion={suggestion}
                        onApply={() => applySuggestion(funnelId, suggestion)}
                        onDismiss={() => dismissSuggestion(suggestion.blockId, suggestion.field)}
                        onGenerateABTest={(testType) => handleGenerateABTest(suggestion.blockId, testType)}
                        loading={loading}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="ab-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                A/B Test Variations
              </CardTitle>
              <CardDescription>
                AI-generated test variations based on your brand personality
              </CardDescription>
            </CardHeader>
            <CardContent>
              {abTestVariations.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No A/B tests created yet. Generate variations from the suggestions tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {abTestVariations.map((variation, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{variation.name}</h4>
                        <Badge variant={variation.status === 'active' ? 'default' : 'secondary'}>
                          {variation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Traffic: {variation.traffic_percentage}%
                      </p>
                      <Progress value={variation.traffic_percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Optimization History
              </CardTitle>
              <CardDescription>
                Track all AI optimizations applied to your funnel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No optimizations applied yet. Start by applying suggestions above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {optimizationHistory.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">
                          {item.optimization_type} Optimization
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">+{item.expected_lift}% lift</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Block: {item.block_id} • Field: {item.field_changed}
                      </p>
                      <p className="text-sm">{item.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {analysisDate && (
        <p className="text-xs text-muted-foreground text-center">
          Last analyzed: {analysisDate.toLocaleString()}
        </p>
      )}
    </div>
  )
}

// Suggestion Card Component
function SuggestionCard({ 
  suggestion, 
  onApply, 
  onDismiss, 
  onGenerateABTest, 
  loading 
}: {
  suggestion: any
  onApply: () => void
  onDismiss: () => void
  onGenerateABTest: (testType: 'headline' | 'cta' | 'copy' | 'style') => void
  loading: boolean
}) {
  const getImpactColor = (lift: number) => {
    if (lift >= 20) return 'border-green-200 bg-green-50'
    if (lift >= 10) return 'border-yellow-200 bg-yellow-50'
    return 'border-blue-200 bg-blue-50'
  }

  const getImpactBadgeColor = (lift: number) => {
    if (lift >= 20) return 'bg-green-100 text-green-800'
    if (lift >= 10) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <div className={`border rounded-lg p-4 ${getImpactColor(suggestion.expectedLift)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={getImpactBadgeColor(suggestion.expectedLift)}>
            +{suggestion.expectedLift}% lift
          </Badge>
          <Badge variant="outline">
            {Math.round(suggestion.confidence * 100)}% confidence
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={onApply} disabled={loading}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={onDismiss}>
            <XCircle className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold capitalize">
          {suggestion.type} • {suggestion.field}
        </h4>
        <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
        
        {suggestion.type === 'content' && (
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-red-600 mb-1">Current:</p>
              <p className="text-sm bg-white p-2 rounded border">
                {suggestion.currentValue}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-green-600 mb-1">Suggested:</p>
              <p className="text-sm bg-white p-2 rounded border">
                {suggestion.suggestedValue}
              </p>
            </div>
          </div>
        )}

        <Separator />
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Block: {suggestion.blockId}</span>
          {(suggestion.field === 'headline' || suggestion.field === 'cta') && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onGenerateABTest(suggestion.field as 'headline' | 'cta')}
              disabled={loading}
            >
              <TestTube className="h-3 w-3 mr-1" />
              A/B Test
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIOptimizationDashboard