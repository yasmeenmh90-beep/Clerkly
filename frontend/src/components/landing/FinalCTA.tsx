"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-80px' }} className="bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#111827] dark:from-[#060d1b] dark:via-[#0a1628] dark:to-[#0f172a] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          {/* Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1/2 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">Ready to eliminate paperwork?</h2>
            <p className="text-base text-slate-400 mb-8 max-w-lg mx-auto">Join 10,000+ teams who trust Clerkly to handle their documents.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link href="/signup">
                <button className="bg-primary text-white px-6 py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2 text-sm">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <button className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg font-bold border border-white/10 hover:bg-white/20 transition-all text-sm">
                Book a Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Setup in 30 seconds</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
