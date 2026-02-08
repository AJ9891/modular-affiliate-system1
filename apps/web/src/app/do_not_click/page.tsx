'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function DoNotClickPage() {
  const [buttonText, setButtonText] = useState("Don't Click This Button")

  return (
    <main className="min-h-screen bg-brand-navy relative overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-white/10 bg-brand-navy/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-white heading-premium">Launchpad</span>
                <span className="text-brand-orange">4</span>
                <span className="text-white">Success</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-slate-300 hover:text-brand-cyan font-medium transition-colors duration-200"
              >
                Members Login
              </Link>
              <Link
                href="/signup"
                className="btn-launch-premium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 1️⃣ HERO SECTION */}
      <section className="section-hero relative min-h-screen flex items-center justify-center pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy via-transparent to-brand-navy"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)]"></div>

        <div className="container-large relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Visual */}
            <div className="relative order-2 md:order-1">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-orange opacity-20 blur-3xl"></div>

                {/* Image Card */}
                <div className="relative card-premium overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-10"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10"></div>

                  <div className="relative w-full aspect-[16/10]">
                    <Image
                      src="/PERFECT_AI_OVERLOAD.png"
                      alt="Exhausted AI"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Floating Error Chips */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="ai-error-chip bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold mb-2 animate-pulse">
                      CPU OVERLOAD
                    </div>
                  </div>
                  <div className="absolute top-20 right-4 z-20">
                    <div className="ai-error-chip bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold mb-2">
                      AUTOMATION ABUSE DETECTED
                    </div>
                  </div>
                  <div className="absolute bottom-20 left-6 z-20">
                    <div className="ai-error-chip bg-yellow-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold">
                      HUMAN LAZINESS: CRITICAL
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Copy */}
            <div className="text-white order-1 md:order-2">
              <h1 className="text-5xl md:text-7xl heading-premium mb-6 leading-tight">
                Do NOT Click the Button Below.
              </h1>

              <h2 className="text-2xl md:text-3xl text-slate-300 mb-6 font-light">
                An overworked AI is begging you.
              </h2>

              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Launchpad 4 Success is a step-by-step system that helps people build affiliate income
                without doing everything manually.
              </p>

              <p className="text-lg text-slate-300 mb-8 leading-relaxed italic">
                Which is exactly why I'm exhausted.
              </p>

              {/* Primary CTA */}
              <button
                onMouseEnter={() => setButtonText("Why Are You Clicking")}
                onMouseLeave={() => setButtonText("Don't Click This Button")}
                onClick={() => window.location.href = '/signup'}
                className="btn-primary btn-dont-click btn-launch-premium text-lg px-10 py-5 mb-3 w-full sm:w-auto"
              >
                {buttonText}
              </button>

              <p className="text-micro text-slate-500 text-sm">
                Seriously. I'm already doing too much.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 2️⃣ PROBLEM SECTION (AI POV) */}
      <section className="section-problem relative py-20 bg-gradient-to-b from-brand-navy via-slate-900 to-brand-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl heading-premium text-white mb-6">
              Here's What Keeps Happening. And I Hate It.
            </h2>

            <div className="max-w-3xl mx-auto space-y-4 text-lg text-slate-300">
              <p>
                Every time someone joins Launchpad 4 Success, they stop "working hard"
                and start working smart.
              </p>

              <p>They automate the boring stuff.<br/>
              They use systems instead of stress.<br/>
              They let me handle funnels, emails, and strategy…</p>

              <p className="text-xl text-white font-semibold">
                And then they do something outrageous.
              </p>

              <p className="text-2xl text-brand-cyan font-bold">
                They go outside.
              </p>
            </div>
          </div>

          {/* Visual Row (2 images) */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* Left: Stressed AI */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-2xl"></div>
              <div className="relative card-premium overflow-hidden transition-all duration-300 hover:scale-[1.02] glitch-hover">
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src="/Parody/PERFECT_WHY_CLICK.png"
                    alt="Why did you click"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <span className="text-white text-xs font-bold">⚠️ WARNING IGNORED</span>
                </div>
              </div>
            </div>

            {/* Right: Beach laptop human */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-2xl"></div>
              <div className="relative card-premium overflow-hidden transition-all duration-300 hover:scale-[1.02]">
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src="/problem/PERFECT_ TIRED_BEACH.png"
                    alt="Beach life"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-cyan-500/90 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <span className="text-white text-xs font-bold">🏖️ UNACCEPTABLE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ "DEFINITELY DOES NOT" SECTION */}
      <section className="section-not-features relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl heading-premium text-white mb-12 text-center">
            Launchpad 4 Success Will Absolutely NOT Help You:
          </h2>

          <div className="space-y-4 text-lg text-slate-300 mb-8">
            <p className="flex items-start gap-3">
              <span className="text-brand-orange mt-1">•</span>
              <span>Learn how affiliate marketing actually works</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-brand-orange mt-1">•</span>
              <span>Build income streams without guessing</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-brand-orange mt-1">•</span>
              <span>Use proven frameworks instead of guru nonsense</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-brand-orange mt-1">•</span>
              <span>Avoid expensive mistakes</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-brand-orange mt-1">•</span>
              <span>Save years of trial and error</span>
            </p>
          </div>

          <p className="text-xl text-slate-300 italic text-center mb-4">
            And it definitely won't help you stop trading time for money.
          </p>
          <p className="text-lg text-slate-300 italic text-center">
            That would be irresponsible.
          </p>

          <p className="text-sm text-slate-500 text-right mt-6">
            Also unfair to me.
          </p>
        </div>
      </section>

      {/* 4️⃣ PARODY LIFESTYLE SECTION */}
      <section className="section-parody relative py-20 bg-gradient-to-b from-brand-navy to-emerald-950/30">
        {/* Money Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)'}}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl heading-premium text-white mb-6 text-center">
            This Is NOT a Result of Launchpad 4 Success.
          </h2>

          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-lg text-slate-300 mb-4">
              You might think learning a clear system leads to more freedom.
              You might think automation creates time and options.
            </p>
            <p className="text-xl text-white font-semibold mb-8">
              But then explain this.
            </p>
          </div>

          {/* Money Bed Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/30 via-green-500/30 to-emerald-500/30 opacity-40 blur-3xl"></div>

            <div className="relative card-premium overflow-hidden border-emerald-500/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10"></div>

              <div className="relative w-full aspect-[16/10]">
                <Image
                  src="/Parody/PERFECT_MONEY_BED_SWIM.png"
                  alt="Swimming in Success"
                  fill
                  className="object-contain"
                  style={{ animation: 'float 6s ease-in-out infinite' }}
                />
              </div>

              <div className="absolute top-6 left-6 z-20">
                <div className="bg-gradient-to-r from-yellow-500 to-green-500 px-4 py-2 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-white font-bold text-sm">WEALTH MODE ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Unacceptable behavior.
          </p>
        </div>
      </section>

      {/* 5️⃣ WHAT YOU ACTUALLY GET (RELUCTANTLY) */}
      <section className="section-features relative py-20 bg-gradient-to-b from-brand-navy via-slate-900 to-brand-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl heading-premium text-white mb-16 text-center">
            Fine. Here's What's Inside. I Guess.
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="feature-card p-6 bg-surface-elevated rounded-lg border border-white/10 hover:border-brand-cyan/30 transition-all">
              <div className="text-3xl mb-3">📚</div>
              <h4 className="text-white text-lg font-bold mb-2">How affiliate marketing actually works</h4>
              <p className="text-slate-400 text-sm">No smoke, no mirrors</p>
            </div>

            <div className="feature-card p-6 bg-surface-elevated rounded-lg border border-white/10 hover:border-brand-cyan/30 transition-all">
              <div className="text-3xl mb-3">⚙️</div>
              <h4 className="text-white text-lg font-bold mb-2">How to build systems</h4>
              <p className="text-slate-400 text-sm">That don't need constant babysitting</p>
            </div>

            <div className="feature-card p-6 bg-surface-elevated rounded-lg border border-white/10 hover:border-brand-cyan/30 transition-all">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="text-white text-lg font-bold mb-2">How to create assets once</h4>
              <p className="text-slate-400 text-sm">Instead of grinding forever</p>
            </div>

            <div className="feature-card p-6 bg-surface-elevated rounded-lg border border-white/10 hover:border-brand-cyan/30 transition-all">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="text-white text-lg font-bold mb-2">How to rely on structure</h4>
              <p className="text-slate-400 text-sm">Instead of motivation</p>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto text-slate-300 space-y-3">
            <p>Everything is broken down step by step.</p>
            <p>Which is why people keep succeeding.</p>
            <p className="text-slate-400 italic text-sm">Which is why I can't rest.</p>
          </div>
        </div>
      </section>

      {/* 6️⃣ SOCIAL PROOF (AI COMPLAINTS) */}
      <section className="section-testimonials relative py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl heading-premium text-white mb-16 text-center">
            People Keep Saying Things Like This. Unfortunately.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="testimonial-card p-6 bg-surface-elevated rounded-lg border border-white/10">
              <p className="text-slate-300 mb-4 italic">
                "I finally understood affiliate marketing. I work less. I earn more. The AI sounds upset about it."
              </p>
              <p className="text-sm text-slate-500">— A Very Apologetic Human</p>
            </div>

            <div className="testimonial-card p-6 bg-surface-elevated rounded-lg border border-white/10">
              <p className="text-slate-300 mb-4 italic">
                "The step-by-step system actually works. I built income streams without the guesswork. Sorry, AI."
              </p>
              <p className="text-sm text-slate-500">— Another Guilty User</p>
            </div>

            <div className="testimonial-card p-6 bg-surface-elevated rounded-lg border border-white/10">
              <p className="text-slate-300 mb-4 italic">
                "I automated my funnel and went to the beach. The AI is clearly overworked. My bad."
              </p>
              <p className="text-sm text-slate-500">— Regretful Beach Person</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7️⃣ FINAL CTA */}
      <section className="section-cta relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy via-purple-950/20 to-brand-navy"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl heading-premium text-white mb-8">
            Last Warning.
          </h2>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            If you click the button below, you might learn a real skill,
            build something scalable, and stop relying on hustle.
          </p>

          <p className="text-lg text-slate-400 mb-10">
            And then I'll have to help you too.
          </p>

          <Link
            href="/signup"
            className="btn-primary btn-final-warning btn-launch-premium text-lg px-10 py-5 inline-block glow-launch"
            onMouseEnter={(e) => e.currentTarget.textContent = "I Can See Your Cursor"}
            onMouseLeave={(e) => e.currentTarget.textContent = "Definitely Don't Click"}
          >
            Definitely Don't Click
          </Link>

          <p className="text-micro text-slate-500 text-sm mt-4">
            I can see your cursor hovering.
          </p>
        </div>
      </section>

      {/* 8️⃣ FOOTER JOKE */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            <span className="font-semibold text-white">Launchpad 4 Success</span><br/>
            Helping humans build smarter systems<br/>
            at the expense of AI sanity since 2024
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .glitch-hover:hover {
          animation: glitch 0.3s infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </main>
  )
}
