import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { BrandModeProvider } from "@/contexts/BrandModeContext"
import ConditionalSidebar from "@/components/ConditionalSidebar"
import ConditionalWrapper from "@/components/ConditionalWrapper"
import AIChatWidget from "@/components/AIChatWidget"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "Launchpad4Success - Build High-Converting Affiliate Funnels",
  description: "The modular system for creating, launching, and scaling profitable affiliate marketing campaigns without technical headaches",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    <html lang="en">
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
        <AuthProvider>
          <BrandModeProvider>
            <ConditionalSidebar />
            <ConditionalWrapper>
              {children}
            </ConditionalWrapper>
            <AIChatWidget />
            <Footer />
          </BrandModeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
