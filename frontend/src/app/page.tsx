import Navbar from '@/components/landing/Navbar'
import AppleScrollHero3D from '@/components/landing/AppleScrollHero3D'
import WorkflowSection from '@/components/landing/WorkflowSection'
import AIAnalysisSection from '@/components/landing/AIAnalysisSection'
import WorkspaceSection from '@/components/landing/WorkspaceSection'
import SecuritySection from '@/components/landing/SecuritySection'
import FinalCTA from '@/components/landing/FinalCTA'
import { FileText } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#0ea5e9]/20">
      <Navbar />
      
      <main className="relative z-10 pb-0">
        <AppleScrollHero3D />
        <WorkflowSection />
        <AIAnalysisSection />
        <WorkspaceSection />
        <SecuritySection />
        <FinalCTA />
      </main>

      <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#0ea5e9] flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">Clerkly</span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed font-medium">
              AI-powered paperwork assistant. Turn unstructured documents into clear information and actionable next steps.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-slate-900 text-sm">Product</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-500">
              <li><a href="#features" className="hover:text-slate-900 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a></li>
              <li><a href="#security" className="hover:text-slate-900 transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-slate-900 text-sm">Account</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-500">
              <li><Link href="/login" className="hover:text-slate-900 transition-colors">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-slate-900 transition-colors">Get Started</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-100 text-sm text-slate-400 font-medium flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Clerkly Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
