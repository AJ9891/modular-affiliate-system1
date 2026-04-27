import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About - Launchpad 4 Success",
  description: "Learn about Launchpad 4 Success, an independent marketing platform created by Abbigal Jurek, focused on practical tools, clear explanations, and real-world implementation.",
}

export default function AboutPage() {
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Launchpad 4 Success",
    "mainEntity": {
      "@type": "Organization",
      "@id": "https://www.launchpad4success.pro/#organization"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <div className="cockpit-container max-w-4xl py-12">
        <h1 className="mb-8 text-4xl font-bold text-text-primary">About Launchpad 4 Success</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <p className="mb-4 text-lg leading-relaxed text-text-secondary">
              Launchpad 4 Success is an independent marketing platform created and written by Abbigal Jurek. 
              The platform was built to help individuals understand, build, and automate online marketing systems 
              without relying on vague advice, high-pressure coaching, or overpriced third-party services.
            </p>
            <p className="mb-4 leading-relaxed text-text-secondary">
              This platform focuses on practical tools, clear explanations, and real-world implementation. 
              The goal is simple: make online marketing more understandable and more usable for people who 
              want results, not noise.
            </p>
            <p className="leading-relaxed text-text-secondary">
              Launchpad 4 Success is not a coaching agency, review service, or "done-for-you" consulting firm. 
              It is a growing platform of resources, systems, and software designed to help users learn how 
              modern digital marketing actually works—and how to apply it in a way that fits their goals.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-text-primary">About the Creator</h2>
            <p className="mb-4 leading-relaxed text-text-secondary">
              My name is Abbigal Jurek, and I created Launchpad 4 Success after years of working with real 
              businesses and seeing the same pattern repeat itself online: confusing advice, recycled tactics, 
              and platforms that promise simplicity but deliver frustration.
            </p>
            <p className="mb-4 leading-relaxed text-text-secondary">
              I believe marketing systems should be:
            </p>
            <ul className="mb-6 list-none space-y-3 pl-0 text-text-secondary">
              <li className="flex items-start">
                <span className="mr-3 text-xl font-bold text-rocket-500">•</span>
                <span>Understandable, not mysterious</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-xl font-bold text-rocket-500">•</span>
                <span>Automated where possible, but transparent</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-xl font-bold text-rocket-500">•</span>
                <span>Built to support real users, not trap them</span>
              </li>
            </ul>
            <p className="leading-relaxed text-text-secondary">
              Launchpad 4 Success reflects that philosophy. Everything here is designed to be modular, 
              adaptable, and grounded in how online platforms actually function—not how they're marketed 
              in sales videos.
            </p>
          </section>

          <section className="card-premium mb-12 rounded-xl border-2 border-rocket-500/30 p-8 shadow-md">
            <h2 className="mb-4 text-3xl font-semibold text-text-primary">Independence & Transparency</h2>
            <p className="mb-4 leading-relaxed text-text-secondary">
              Launchpad 4 Success is an independent marketing platform and is not affiliated with any 
              third-party "Launchpad" review, coaching, or consulting services discussed on Reddit or 
              elsewhere online.
            </p>
            <p className="mb-4 leading-relaxed text-text-secondary">
              The platform, its content, and its tools are developed independently and are intended to 
              stand on their own merit. Any similarly named services, reviews, or discussions found online 
              are not connected to this platform unless explicitly stated here.
            </p>
            <p className="font-semibold leading-relaxed text-text-primary">
              Transparency matters. Clarity matters. This page exists so users know exactly who is behind 
              the platform and what it represents.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-6 text-3xl font-semibold text-text-primary">The Bigger Picture</h2>
            <p className="mb-4 leading-relaxed text-text-secondary">
              The internet doesn't need more hype. It needs clearer systems, better tools, and honest explanations.
            </p>
            <p className="font-medium leading-relaxed text-text-secondary">
              Launchpad 4 Success exists to provide those things—one step, one system, and one improvement at a time.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
