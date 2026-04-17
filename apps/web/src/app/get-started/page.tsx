import Link from 'next/link'

export default function GetStarted() {
  return (
    <main className="cockpit-container min-h-screen py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-8 inline-block text-text-secondary transition-colors hover:text-rocket-500">
          ← Back to Home
        </Link>
        
        <div className="card-premium rounded-2xl border-2 border-[var(--border-elevated)] p-12">
          <h1 className="mb-6 text-4xl font-bold text-text-primary">
            Get Started with <span className="text-rocket-500">Launchpad 4 Success</span>
          </h1>
          <p className="mb-8 text-xl text-text-secondary">
            Ready to build your first profitable funnel? Let's get you started!
          </p>
          
          <div className="space-y-6">
            <div className="rounded-r-lg border-l-4 border-rocket-500 bg-[var(--accent-soft)] py-4 pl-6">
              <h3 className="mb-2 text-xl font-bold text-text-primary">⚡ Step 1: Create Your Account</h3>
              <p className="text-text-secondary">Sign up and access the dashboard</p>
            </div>
            
            <div className="rounded-r-lg border-l-4 border-rocket-500 bg-[var(--accent-soft)] py-4 pl-6">
              <h3 className="mb-2 text-xl font-bold text-text-primary">🎯 Step 2: Choose Your Niche</h3>
              <p className="text-text-secondary">Select from health, finance, tech, or custom niches</p>
            </div>
            
            <div className="rounded-r-lg border-l-4 border-rocket-500 bg-[var(--accent-soft)] py-4 pl-6">
              <h3 className="mb-2 text-xl font-bold text-text-primary">🛠️ Step 3: Build Your Funnel</h3>
              <p className="text-text-secondary">Use our drag-and-drop builder to create pages</p>
            </div>
            
            <div className="rounded-r-lg border-l-4 border-rocket-500 bg-[var(--accent-soft)] py-4 pl-6">
              <h3 className="mb-2 text-xl font-bold text-text-primary">🚀 Step 4: Launch & Profit</h3>
              <p className="text-text-secondary">Deploy your funnel and start earning commissions</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="btn-launch-premium text-xl px-12 py-5"
            >
              3...2...1... LAUNCH! 🚀
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
