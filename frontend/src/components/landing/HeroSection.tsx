"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Sparkles, Star, Brain, FileText } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="aurora-blob-1 absolute -top-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full" />
        <div className="aurora-blob-2 absolute top-[10%] right-[5%] w-[40vw] h-[40vw] rounded-full" />
        <div className="aurora-blob-3 absolute bottom-0 left-[30%] w-[35vw] h-[35vw] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-primary text-xs font-bold tracking-widest uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Document Intelligence</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-[68px] font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
              Paperwork,<br />
              <span className="text-primary">handled.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
              Clerkly uses AI to understand, extract, and organize your documents — so you can focus on what matters.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/signup">
                <button className="bg-primary text-white px-6 py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="#how-it-works">
                <button className="bg-card text-foreground px-6 py-3 rounded-lg font-bold border border-border hover:bg-muted transition-colors text-sm w-full sm:w-auto">
                  See How It Works →
                </button>
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Setup in 30 seconds</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Cancel anytime</span>
            </motion.div>

            {/* Social Proof */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0,1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 border-2 border-background flex items-center justify-center text-white text-[10px] font-bold">
                    {['M','S','D','E'][i]}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5">
                  {[0,1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-xs text-muted-foreground font-medium">4.9/5 from 10,000+ teams</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Document Composition */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative hidden lg:block">
            <div className="relative w-full h-[560px]">
              {/* Background paper layers */}
              <div className="absolute top-4 left-8 w-[340px] h-[460px] paper-surface rounded-lg rotate-[-3deg] opacity-60" />
              <div className="absolute top-2 left-6 w-[340px] h-[460px] paper-surface rounded-lg rotate-[-1.5deg] opacity-80" />

              {/* Main Document */}
              <div className="absolute top-0 left-4 w-[340px] paper-surface rounded-lg p-8 z-10">
                <div className="border-b-2 border-foreground pb-3 mb-6">
                  <h3 className="text-lg font-black text-foreground tracking-tight">BUSINESS REGISTRATION</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Company Name</div>
                    <div className="text-sm font-semibold text-foreground border-b border-border pb-1">Acme Solutions LLC</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Entity Type</div>
                    <div className="text-sm font-semibold text-foreground border-b border-border pb-1">Limited Liability Company</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Registration Date</div>
                    <div className="text-sm font-semibold text-foreground border-b border-border pb-1">March 15, 2024</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">EIN</div>
                    <div className="text-sm font-semibold text-foreground border-b border-border pb-1">12-3456789</div>
                  </div>
                  <div className="pt-4">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Authorized Signature</div>
                    <div className="h-10 border-b border-foreground flex items-end pb-1 w-2/3">
                      <span className="text-xl text-foreground italic -rotate-3">Jane Doe</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Extracted Card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="absolute top-6 right-0 w-[200px] glass-floating-card rounded-xl p-4 z-20">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">AI Extracted</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-muted p-2 rounded-lg"><div className="text-[9px] text-muted-foreground font-semibold uppercase">Company</div><div className="text-xs font-bold text-foreground">Acme Solutions LLC</div></div>
                  <div className="bg-muted p-2 rounded-lg"><div className="text-[9px] text-muted-foreground font-semibold uppercase">EIN</div><div className="text-xs font-bold text-foreground">12-3456789</div></div>
                  <div className="bg-muted p-2 rounded-lg"><div className="text-[9px] text-muted-foreground font-semibold uppercase">Date</div><div className="text-xs font-bold text-foreground">Mar 15, 2024</div></div>
                </div>
              </motion.div>

              {/* Confidence Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1 }} className="absolute bottom-24 right-4 w-[200px] glass-floating-card rounded-xl p-4 z-30">
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-foreground tracking-wide uppercase">Clerkly AI</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Confidence Score</div>
                <div className="text-2xl font-black text-primary mb-1">98.4%</div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className="h-full w-[98.4%] bg-primary rounded-full" /></div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1 text-right">High confidence</div>
              </motion.div>

              {/* Review Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.2 }} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[240px] glass-floating-card rounded-xl p-4 z-40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-foreground tracking-wide uppercase">Needs Review</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /><span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">Review</span></div>
                </div>
                <button className="w-full bg-primary text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Approve</button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Trust Logos */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }} className="mt-20 pt-12 border-t border-border">
          <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase text-center mb-8">Trusted by teams at</p>
          <div className="flex items-center justify-center gap-10 flex-wrap opacity-40 dark:opacity-30">
            {['Linear', 'Notion', 'ramp', 'Vercel', 'stripe', 'Brex'].map(name => (
              <span key={name} className="text-foreground font-bold text-lg tracking-tight">{name}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
