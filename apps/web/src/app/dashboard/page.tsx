import StripeConnectSection from '@/components/StripeConnectSection'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [teamData, setTeamData] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadTeamData()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (!response.ok) {
        router.push('/login')
        return
      }
      
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadTeamData = async () => {
    try {
      const response = await fetch('/api/team')
      if (response.ok) {
        const data = await response.json()
        setTeamData(data)
      }
    } catch (error) {
      console.error('Failed to load team data:', error)
    }
  }

  const handleLogout = async () => {
    // Clear session and redirect to home
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gradient launch-pad">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-navy shadow-lg border-b border-brand-purple/30">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">
            <span className="text-white">Launchpad</span><span className="text-brand-orange">4</span><span className="text-white">Success</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-brand-purple text-white hover:bg-brand-orange rounded-lg transition-colors font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your funnels</p>
        </div>

        {/* Team Info Banner */}
        {teamData && (teamData.isOwner || teamData.memberOf?.length > 0) && (
          <div className="bg-brand-purple/10 border-2 border-brand-purple/30 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="font-semibold text-brand-purple">
                    {teamData.isOwner 
                      ? `Team: ${teamData.ownedTeam?.length || 0} member${teamData.ownedTeam?.length !== 1 ? 's' : ''}`
                      : `You're part of ${teamData.memberOf?.length || 0} team${teamData.memberOf?.length !== 1 ? 's' : ''}`
                    }
                  </p>
                  <p className="text-sm text-brand-navy">
                    {teamData.isOwner 
                      ? 'Manage your team members and permissions'
                      : 'Collaborate with your team on funnels'
                    }
                  </p>
                </div>
              </div>
              <Link
                href="/team"
                className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-orange font-semibold transition-colors"
              >
                Manage Team
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-brand-purple">
            <div className="text-sm text-brand-purple mb-1 font-semibold">Total Funnels</div>
            <div className="text-3xl font-bold text-brand-navy">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-brand-cyan">
            <div className="text-sm text-brand-cyan mb-1 font-semibold">Total Clicks</div>
            <div className="text-3xl font-bold text-brand-navy">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-brand-orange">
            <div className="text-sm text-brand-orange mb-1 font-semibold">Conversions</div>
            <div className="text-3xl font-bold text-brand-navy">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-brand-purple">
            <div className="text-sm text-brand-purple mb-1 font-semibold">Revenue</div>
            <div className="text-3xl font-bold text-brand-navy">$0</div>
          </div>
        </div>

        {/* Stripe Connect Section */}
        <StripeConnectSection />

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link
              href="/builder"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600">Create New Funnel</h3>
              <p className="text-sm text-gray-600">Start building a new affiliate funnel</p>
            </Link>
            
            <Link
              href="/offers"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-green-600">Manage Offers</h3>
              <p className="text-sm text-gray-600">Add and track affiliate offers</p>
            </Link>
            
            <Link
              href="/analytics"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-yellow-500 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-600">View Analytics</h3>
              <p className="text-sm text-gray-600">Track clicks and conversions</p>
            </Link>
            
            <Link
              href="/ai-generator"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-purple-600">AI Content Generator</h3>
              <p className="text-sm text-gray-600">Create copy with AI</p>
            </Link>
            
            <Link
              href="/niches"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600">Browse Niches</h3>
              <p className="text-sm text-gray-600">Explore pre-built niche modules</p>
            </Link>
            
            <Link
              href="/domains"
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-green-600">Domain Settings</h3>
              <p className="text-sm text-gray-600">Setup subdomain or custom domain</p>
            </Link>
          </div>
        </div>

        {/* Sendshark Email Automation CTA */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-5xl">📧</div>
                <h2 className="text-3xl font-bold">Email Automation Included with Your Subscription!</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4 border-2 border-white/40">
                <p className="text-xl font-bold text-white mb-1">
                  ✨ Great News! Sendshark is Already Included in Your Monthly Payment!
                </p>
                <p className="text-white/90">
                  Your Launchpad4Success subscription covers Sendshark - no extra charges. Just click below to activate your account!
                </p>
              </div>
              <p className="text-white/90 text-lg mb-4 max-w-3xl">
                Automatically capture leads from your funnels and nurture them with powerful email sequences. 
                Sendshark integrates seamlessly with Launchpad4Success to turn visitors into customers!
              </p>
              <ul className="space-y-2 mb-6 text-white/90">
                <li className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Automatic lead capture from all your funnels</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Pre-built email automation sequences</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Professional email templates included</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Track opens, clicks, and conversions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span className="font-bold">Already paid for with your subscription - No additional cost!</span>
                </li>
              </ul>
              <a
                href="https://sendshark.com/launch/ecfunnel?id=Abby9891"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
              >
                Activate Your Sendshark Account (Included FREE) 🚀
              </a>
            </div>
            <div className="hidden lg:block text-9xl ml-8">
              🦈
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-2">Ready to Launch Your First Funnel?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            You haven't created any funnels yet. Let's get started by choosing a niche and building your first high-converting funnel!
          </p>
          <Link
            href="/builder"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Create Your First Funnel
          </Link>
        </div>
      </div>
    </main>
  )
}
