import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import WorkflowSection from '@/components/landing/WorkflowSection'
import AIAnalysisSection from '@/components/landing/AIAnalysisSection'
import WorkspaceSection from '@/components/landing/WorkspaceSection'
import SecuritySection from '@/components/landing/SecuritySection'
import SocialProofSection from '@/components/landing/SocialProofSection'
import FinalCTA from '@/components/landing/FinalCTA'
import { FileText } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Navbar />
      
      <main className="relative z-10">
        <HeroSection />
        <WorkflowSection />
        <AIAnalysisSection />
        <WorkspaceSection />
        <SecuritySection />
        <SocialProofSection />
        <FinalCTA />
      </main>

      <footer className="border-t border-border bg-card pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">Clerkly</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              AI-powered paperwork assistant. Turn unstructured documents into clear information and actionable next steps.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
              <li><a href="#security" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground text-sm">Account</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Get Started</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-border text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Clerkly Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
