import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { BrandModeProvider } from "@/contexts/BrandModeContext"
import { PersonalityThemeProvider } from "@/components/PersonalityThemeProvider"
import { getPersonalityContext } from "@/lib/brand/getPersonalityContext"
import ConditionalSidebar from "@/components/ConditionalSidebar"
import ConditionalWrapper from "@/components/ConditionalWrapper"
import AIChatWidget from "@/components/AIChatWidget"
import Footer from "@/components/Footer"
import { LaunchpadAmbientSound } from "@/components/LaunchpadAmbientSound"

export const metadata: Metadata = {
  title: "Launchpad4Success - Build High-Converting Affiliate Funnels",
  description: "The modular system for creating, launching, and scaling profitable affiliate marketing campaigns without technical headaches",
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <PersonalityThemeProvider personality={personality}>
          <AuthProvider>
            <BrandModeProvider>
              <ConditionalSidebar />
              <ConditionalWrapper>
                {children}
              </ConditionalWrapper>
              <AIChatWidget />
              <LaunchpadAmbientSound />
              <Footer />
            </BrandModeProvider>
          </AuthProvider>
        </PersonalityThemeProvider>
        
        {/* Development Error Debugging Script */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
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
              `
            }}
          />
        )}
      </body>
    </html>
  )
}
