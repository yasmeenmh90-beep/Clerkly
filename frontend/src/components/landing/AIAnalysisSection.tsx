"use client"

import { motion } from 'framer-motion'
import { Check, FileText } from 'lucide-react'

export default function AIAnalysisSection() {
  return (
    <section id="features" className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Text */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }}>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-6 leading-tight">
              AI that understands<br /><span className="text-muted-foreground">your documents</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Clerkly combines advanced AI with deep document understanding to extract the right data — every time.
            </p>
            <ul className="space-y-3 mb-8">
              {['Trained on thousands of document types', 'High accuracy with confidence scoring', 'Continuously learning and improving'].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"><Check className="w-3 h-3 text-primary" /></div>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <a href="#features" className="inline-flex items-center gap-1 text-sm font-bold text-foreground border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors">See AI in action →</a>
          </motion.div>

          {/* Right Visual */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: 0.2 }} className="relative">
            <div className="glass-surface rounded-2xl p-6 flex gap-4">
              {/* Document */}
              <div className="flex-1 paper-surface rounded-xl p-6 min-h-[380px] relative">
                <div className="border-b-2 border-foreground pb-2 mb-5">
                  <h3 className="text-base font-black text-foreground tracking-tight">VENDOR AGREEMENT</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Vendor</div>
                    <div className="text-sm font-semibold text-foreground border-b border-border pb-1">Acme Solutions LLC</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-1.5 bg-primary/10 border border-primary/30 rounded animate-pulse" />
                    <div className="relative">
                      <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Amount</div>
                      <div className="text-sm font-semibold text-foreground border-b border-border pb-1">$12,500.00</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Effective Date</div>
                    <div className="text-sm font-semibold text-foreground border-b border-border pb-1">December 15, 2024</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Document Type</div>
                    <div className="text-sm font-semibold text-foreground border-b border-border pb-1">Vendor Agreement</div>
                  </div>
                </div>
              </div>
              {/* Extracted Panel */}
              <div className="w-52 glass-floating-card rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-foreground tracking-widest uppercase">Extracted Data</span>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="bg-muted p-2.5 rounded-lg"><div className="text-[9px] text-muted-foreground font-semibold uppercase">Vendor</div><div className="text-xs font-bold text-foreground">Acme Solutions LLC</div></div>
                  <div className="bg-muted p-2.5 rounded-lg border border-primary/30"><div className="text-[9px] text-primary font-semibold uppercase">Amount</div><div className="text-xs font-bold text-foreground">$12,500.00</div></div>
                  <div className="bg-muted p-2.5 rounded-lg"><div className="text-[9px] text-muted-foreground font-semibold uppercase">Vendor Agreement</div><div className="text-xs font-bold text-foreground">$2.5k</div></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
