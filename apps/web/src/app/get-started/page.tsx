import Link from 'next/link'

export default function GetStarted() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-white hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">
            Get Started with Launchpad<span className="text-yellow-400">4</span>Success
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Ready to build your first profitable funnel? Let's get you started!
          </p>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6 py-4">
              <h3 className="text-xl font-bold mb-2">Step 1: Create Your Account</h3>
              <p className="text-gray-600">Sign up for free and access the dashboard</p>
            </div>
            
            <div className="border-l-4 border-purple-600 pl-6 py-4">
              <h3 className="text-xl font-bold mb-2">Step 2: Choose Your Niche</h3>
              <p className="text-gray-600">Select from health, finance, tech, or custom niches</p>
            </div>
            
            <div className="border-l-4 border-green-600 pl-6 py-4">
              <h3 className="text-xl font-bold mb-2">Step 3: Build Your Funnel</h3>
              <p className="text-gray-600">Use our drag-and-drop builder to create pages</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-6 py-4">
              <h3 className="text-xl font-bold mb-2">Step 4: Launch & Profit</h3>
              <p className="text-gray-600">Deploy your funnel and start earning commissions</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="inline-block px-12 py-5 bg-gradient-to-r from-blue-600 to-green-600 text-white text-lg font-bold rounded-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Create Free Account Now 🚀
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
