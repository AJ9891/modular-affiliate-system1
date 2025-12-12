import Link from 'next/link'

export default function GetStarted() {
  return (
    <main className="min-h-screen bg-brand-gradient launch-pad p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-white hover:text-brand-cyan mb-8 inline-block transition-colors">
          ← Back to Home
        </Link>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-12 border-2 border-brand-purple/20">
          <h1 className="text-4xl font-bold mb-6 text-brand-navy">
            Get Started with <span className="text-brand-purple">Launchpad</span><span className="text-brand-orange">4</span><span className="text-brand-purple">Success</span>
          </h1>
          <p className="text-xl text-brand-purple mb-8">
            Ready to build your first profitable funnel? Let's get you started!
          </p>
          
          <div className="space-y-6">
            <div className="border-l-4 border-brand-purple pl-6 py-4 bg-brand-purple/5 rounded-r-lg">
              <h3 className="text-xl font-bold mb-2 text-brand-purple">⚡ Step 1: Create Your Account</h3>
              <p className="text-brand-navy">Sign up and access the dashboard</p>
            </div>
            
            <div className="border-l-4 border-brand-cyan pl-6 py-4 bg-brand-cyan/5 rounded-r-lg">
              <h3 className="text-xl font-bold mb-2 text-brand-cyan">🎯 Step 2: Choose Your Niche</h3>
              <p className="text-brand-navy">Select from health, finance, tech, or custom niches</p>
            </div>
            
            <div className="border-l-4 border-brand-orange pl-6 py-4 bg-brand-orange/5 rounded-r-lg">
              <h3 className="text-xl font-bold mb-2 text-brand-orange">🛠️ Step 3: Build Your Funnel</h3>
              <p className="text-brand-navy">Use our drag-and-drop builder to create pages</p>
            </div>
            
            <div className="border-l-4 border-brand-purple pl-6 py-4 bg-brand-purple/5 rounded-r-lg">
              <h3 className="text-xl font-bold mb-2 text-brand-purple">🚀 Step 4: Launch & Profit</h3>
              <p className="text-brand-navy">Deploy your funnel and start earning commissions</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="btn-launch text-xl px-12 py-5"
            >
              3...2...1... LAUNCH! 🚀
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
