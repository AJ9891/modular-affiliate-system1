/**
 * Personality Theme Usage Guidelines
 * 
 * ✅ DO use personality accents for:
 * - Empty states
 * - Callouts  
 * - Focus rings
 * - Section headers
 * - Progress / success feedback
 * 
 * ❌ DON'T use personality accents for:
 * - Backgrounds
 * - Full cards
 * - Large text blocks
 * - Navigation chrome
 */

import { type Personality } from "@/lib/theme/personalityTheme"

// Example: Tasteful accent usage
export function PersonalityAccentExamples() {
  return (
    <div className="bg-bg-primary text-text-primary p-6">
      
      {/* ✅ Section header with accent */}
      <h2 className="text-xl font-semibold mb-4 border-l-2 border-accent pl-4">
        Dashboard Overview
      </h2>
      
      {/* ✅ Callout with soft accent background */}
      <div className="bg-[var(--accent-soft)] border border-[var(--border-subtle)] rounded-md p-4 mb-6">
        <p className="text-text-secondary">
          Your funnel is performing well this week.
        </p>
      </div>
      
      {/* ✅ Progress indicator with accent */}
      <div className="mb-6">
        <div className="bg-bg-secondary rounded-full h-2">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: '75%' }}
          />
        </div>
      </div>
      
      {/* ✅ Focus ring example */}
      <button className="bg-bg-surface text-text-primary px-4 py-2 rounded-md border border-[var(--border-subtle)] focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:outline-none transition-fast">
        Click me
      </button>
      
      {/* ✅ Empty state with accent icon */}
      <div className="text-center py-12 text-text-muted">
        <div className="w-12 h-12 bg-[var(--accent-soft)] text-accent rounded-full flex items-center justify-center mx-auto mb-4">
          📊
        </div>
        <p>No data available yet</p>
        <p className="text-sm mt-2">Create your first funnel to get started</p>
      </div>
      
    </div>
  )
}

// Example: Clean base component (no personality colors)
export function BaseCard({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`bg-bg-surface border border-[var(--border-subtle)] rounded-md p-6 ${className}`}>
      {children}
    </div>
  )
}

// Example: Personality-aware status indicator
export function StatusBadge({ 
  status, 
  children 
}: { 
  status: 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode 
}) {
  const statusClasses = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', 
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-[var(--accent-soft)] text-accent border-accent/20', // Uses personality accent
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium border ${statusClasses[status]}`}>
      {children}
    </span>
  )
}