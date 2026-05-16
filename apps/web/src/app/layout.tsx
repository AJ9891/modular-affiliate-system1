import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { BrandModeProvider } from "@/contexts/BrandModeContext"
import { PersonalityThemeProvider } from "@/components/PersonalityThemeProvider"
import { getPersonalityContext } from "@/lib/brand/getPersonalityContext"
import AIChatWidget from "@/components/AIChatWidget"
import Footer from "@/components/Footer"
import { LaunchpadAmbientSound } from "@/components/LaunchpadAmbientSound"
import { TelemetryObserver } from "@/components/TelemetryObserver"
import { ShipRoomStyler } from "@/components/ShipRoomStyler"
import { BrandModeGlowSync } from "@/components/BrandModeGlowSync"
import ConditionalSidebar from "@/components/ConditionalSidebar"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.launchpad4success.pro"),
  title: {
    default: "Launchpad4Success.pro | Build High-Converting Affiliate Funnels",
    template: "%s | Launchpad4Success.pro",
  },
  description:
    "Launchpad4Success.pro helps creators and affiliate marketers build, launch, and scale conversion-focused funnels, email systems, and monetization workflows.",
  applicationName: "Launchpad4Success.pro",
  keywords: [
    "Launchpad4Success",
    "Launchpad4Success.pro",
    "affiliate marketing funnels",
    "high-converting funnels",
    "email automation",
    "digital marketing system",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.launchpad4success.pro",
    siteName: "Launchpad4Success.pro",
    title: "Launchpad4Success.pro | Build High-Converting Affiliate Funnels",
    description:
      "Launchpad4Success.pro helps creators and affiliate marketers launch conversion-focused funnels and scalable marketing workflows.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Launchpad4Success.pro | Build High-Converting Affiliate Funnels",
    description:
      "Build, launch, and scale affiliate funnels with Launchpad4Success.pro.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get personality based on current context
  const personality = getPersonalityContext()

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.launchpad4success.pro/#organization",
    "name": "Launchpad 4 Success",
    "url": "https://www.launchpad4success.pro",
    "description": "Launchpad 4 Success is an independent marketing platform created by Abbigal Jurek, focused on practical tools, systems, and automation for online marketing. The platform is not affiliated with third-party Launchpad review, coaching, or consulting services.",
    "founder": {
      "@type": "Person",
      "@id": "https://www.launchpad4success.pro/#person",
      "name": "Abbigal Jurek"
    },
    "brand": {
      "@type": "Brand",
      "name": "Launchpad 4 Success"
    }
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.launchpad4success.pro/#person",
    "name": "Abbigal Jurek",
    "creatorOf": {
      "@type": "Organization",
      "@id": "https://www.launchpad4success.pro/#organization"
    },
    "worksFor": {
      "@type": "Organization",
      "@id": "https://www.launchpad4success.pro/#organization"
    },
    "description": "Creator of Launchpad 4 Success, an independent marketing platform focused on clear systems, automation, and practical implementation."
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var ATTR = 'fdprocessedid';

                function cleanNode(node) {
                  if (!(node instanceof Element)) return;
                  if (node.hasAttribute(ATTR)) node.removeAttribute(ATTR);
                  var tagged = node.querySelectorAll('[' + ATTR + ']');
                  for (var i = 0; i < tagged.length; i += 1) {
                    tagged[i].removeAttribute(ATTR);
                  }
                }

                function cleanDocument() {
                  cleanNode(document.documentElement);
                }

                cleanDocument();

                var observer = new MutationObserver(function (mutations) {
                  for (var i = 0; i < mutations.length; i += 1) {
                    var mutation = mutations[i];

                    if (
                      mutation.type === 'attributes' &&
                      mutation.attributeName === ATTR &&
                      mutation.target instanceof Element
                    ) {
                      mutation.target.removeAttribute(ATTR);
                    }

                    if (mutation.addedNodes && mutation.addedNodes.length) {
                      for (var j = 0; j < mutation.addedNodes.length; j += 1) {
                        cleanNode(mutation.addedNodes[j]);
                      }
                    }
                  }
                });

                observer.observe(document.documentElement, {
                  subtree: true,
                  childList: true,
                  attributes: true,
                  attributeFilter: [ATTR],
                });

                window.addEventListener('DOMContentLoaded', cleanDocument);
                window.addEventListener(
                  'load',
                  function () {
                    setTimeout(function () {
                      observer.disconnect();
                    }, 5000);
                  },
                  { once: true }
                );
              })();
            `,
          }}
        />
        <meta name="author" content="Abbigal Jurek" />
        <meta name="publisher" content="Launchpad4Success.pro" />
        <meta name="creator" content="Launchpad4Success.pro" />
        <meta
          name="format-detection"
          content="telephone=no, address=no, email=no"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <ShipRoomStyler />
        <PersonalityThemeProvider personality={personality}>
          <AuthProvider>
            <BrandModeProvider>
              <BrandModeGlowSync />
              <div className="rocket-room-shell">
                <div className="rocket-room-content">
                  <ConditionalSidebar>{children}</ConditionalSidebar>
                </div>
              </div>
              <TelemetryObserver />
              <AIChatWidget />
              <LaunchpadAmbientSound />
              <Footer />
            </BrandModeProvider>
          </AuthProvider>
        </PersonalityThemeProvider>
        
        {/* Development Error Debugging Script */}
        {process.env.NODE_ENV === 'development' && (
          <Script id="dev-error-debugger" strategy="afterInteractive">
            {`
              console.log('🔧 Development Error Debugging Active');
              console.log('Environment: ${process.env.NODE_ENV}');
              
              // Override console.error to catch React #310 errors
              const originalError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes('Minified React error #310')) {
                  console.group('🚨 REACT ERROR #310 DETECTED - HOOKS RULE VIOLATION!');
                  console.error('Visit https://react.dev/errors/310 for details');
                  console.error('Common causes:');
                  console.error('1. Conditional hooks (useState inside if statements)');
                  console.error('2. Hooks in loops or after early returns');
                  console.error('3. Hooks called in event handlers');
                  console.error('4. Different hook count on re-renders');
                  console.error('Stack trace:', new Error().stack);
                  console.groupEnd();
                }
                return originalError.apply(this, args);
              };
              
              console.log('✅ React error debugging is now active');
            `}
          </Script>
        )}
      </body>
    </html>
  )
}
