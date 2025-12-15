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
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">About Launchpad 4 Success</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <p className="text-gray-700 mb-4 text-lg leading-relaxed">
              Launchpad 4 Success is an independent marketing platform created and written by Abbigal Jurek. 
              The platform was built to help individuals understand, build, and automate online marketing systems 
              without relying on vague advice, high-pressure coaching, or overpriced third-party services.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              This platform focuses on practical tools, clear explanations, and real-world implementation. 
              The goal is simple: make online marketing more understandable and more usable for people who 
              want results, not noise.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Launchpad 4 Success is not a coaching agency, review service, or "done-for-you" consulting firm. 
              It is a growing platform of resources, systems, and software designed to help users learn how 
              modern digital marketing actually works—and how to apply it in a way that fits their goals.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">About the Creator</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              My name is Abbigal Jurek, and I created Launchpad 4 Success after years of working with real 
              businesses and seeing the same pattern repeat itself online: confusing advice, recycled tactics, 
              and platforms that promise simplicity but deliver frustration.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              I believe marketing systems should be:
            </p>
            <ul className="list-none pl-0 text-gray-700 space-y-3 mb-6">
              <li className="flex items-start">
                <span className="mr-3 text-blue-600 font-bold">•</span>
                <span>Understandable, not mysterious</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-600 font-bold">•</span>
                <span>Automated where possible, but transparent</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-600 font-bold">•</span>
                <span>Built to support real users, not trap them</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Launchpad 4 Success reflects that philosophy. Everything here is designed to be modular, 
              adaptable, and grounded in how online platforms actually function—not how they're marketed 
              in sales videos.
            </p>
          </section>

          <section className="mb-12 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-3xl font-semibold mb-4">Independence & Transparency</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Launchpad 4 Success is an independent marketing platform and is not affiliated with any 
              third-party "Launchpad" review, coaching, or consulting services discussed on Reddit or 
              elsewhere online.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The platform, its content, and its tools are developed independently and are intended to 
              stand on their own merit. Any similarly named services, reviews, or discussions found online 
              are not connected to this platform unless explicitly stated here.
            </p>
            <p className="text-gray-700 font-medium leading-relaxed">
              Transparency matters. Clarity matters. This page exists so users know exactly who is behind 
              the platform and what it represents.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-6">The Bigger Picture</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The internet doesn't need more hype. It needs clearer systems, better tools, and honest explanations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Launchpad 4 Success exists to provide those things—one step, one system, and one improvement at a time.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
