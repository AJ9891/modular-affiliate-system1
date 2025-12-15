import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
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
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <ConditionalSidebar />
          <ConditionalWrapper>
            {children}
          </ConditionalWrapper>
          <AIChatWidget />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
