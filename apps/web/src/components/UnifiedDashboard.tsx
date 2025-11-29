'use client'

import React, { useState, useEffect } from 'react'
import { Mail, Users, TrendingUp, DollarSign, BarChart3, Calendar, Download, RefreshCw } from 'lucide-react'

interface DashboardStats {
  totalLeads: number
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  conversionRate: number
  avgRevenuePerLead: number
  emailsSent: number
  emailOpenRate: number
}

interface RecentActivity {
  id: string
  type: 'lead' | 'click' | 'conversion' | 'email'
  description: string
  timestamp: Date
  amount?: number
}

export default function UnifiedDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    conversionRate: 0,
    avgRevenuePerLead: 0,
    emailsSent: 0,
    emailOpenRate: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch analytics
      const response = await fetch(`/api/analytics?range=${dateRange}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setRecentActivity(data.recentActivity || [])
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      // Send analytics report via email
      const userEmail = 'user@example.com' // Get from auth context
      await fetch('/api/email/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: userEmail,
          funnelId: 'all',
          dateRange: {
            start: new Date(Date.now() - getDaysInMs(dateRange)).toISOString(),
            end: new Date().toISOString()
          }
        })
      })
      alert('Report sent to your email!')
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to send report')
    }
  }

  const getDaysInMs = (range: string) => {
    const days = parseInt(range)
    return days * 24 * 60 * 60 * 1000
  }

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    change, 
    color 
  }: { 
    icon: any
    label: string
    value: string | number
    change?: string
    color: string 
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} vs last period
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your affiliate performance overview.</p>
          </div>
          <div className="flex gap-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={exportReport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Leads"
          value={stats.totalLeads.toLocaleString()}
          change="+12%"
          color="bg-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversions"
          value={stats.totalConversions.toLocaleString()}
          change="+8%"
          color="bg-green-500"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+15%"
          color="bg-purple-500"
        />
        <StatCard
          icon={Mail}
          label="Email Open Rate"
          value={`${(stats.emailOpenRate * 100).toFixed(1)}%`}
          change="+5%"
          color="bg-orange-500"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">Conversion Rate</h3>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {(stats.conversionRate * 100).toFixed(2)}%
          </div>
          <p className="text-sm text-gray-600">
            {stats.totalConversions} conversions from {stats.totalClicks} clicks
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">Avg Revenue Per Lead</h3>
          <div className="text-4xl font-bold text-green-600 mb-2">
            ${stats.avgRevenuePerLead.toFixed(2)}
          </div>
          <p className="text-sm text-gray-600">
            Based on {stats.totalLeads} total leads
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">Emails Sent</h3>
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {stats.emailsSent.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">
            Across all campaigns and automations
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="font-bold text-lg">Recent Activity</h3>
        </div>
        <div className="divide-y">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No recent activity
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`
                    p-2 rounded-full
                    ${activity.type === 'lead' ? 'bg-blue-100' : ''}
                    ${activity.type === 'click' ? 'bg-yellow-100' : ''}
                    ${activity.type === 'conversion' ? 'bg-green-100' : ''}
                    ${activity.type === 'email' ? 'bg-purple-100' : ''}
                  `}>
                    {activity.type === 'lead' && <Users size={16} className="text-blue-600" />}
                    {activity.type === 'click' && <TrendingUp size={16} className="text-yellow-600" />}
                    {activity.type === 'conversion' && <DollarSign size={16} className="text-green-600" />}
                    {activity.type === 'email' && <Mail size={16} className="text-purple-600" />}
                  </div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <div className="text-green-600 font-bold">
                    +${activity.amount.toFixed(2)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/builder"
          className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          <h3 className="font-bold text-lg mb-2">Create New Funnel</h3>
          <p className="text-blue-100">Build a high-converting landing page</p>
        </a>
        <a
          href="/offers"
          className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          <h3 className="font-bold text-lg mb-2">Browse Offers</h3>
          <p className="text-purple-100">Find profitable affiliate products</p>
        </a>
        <a
          href="/analytics"
          className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          <h3 className="font-bold text-lg mb-2">View Analytics</h3>
          <p className="text-green-100">Deep dive into your performance</p>
        </a>
      </div>
    </div>
  )
}
