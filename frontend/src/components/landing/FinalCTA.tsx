"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function FinalCTA() {
  return (
    <section className="py-40 max-w-5xl mx-auto px-6 text-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.08)_0%,transparent_100%)] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={spring}
        className="relative z-10"
      >
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
          Ready to handle <br /> paperwork differently?
        </h2>
        <Link href="/signup">
          <button className="bg-slate-900 text-white px-10 py-5 rounded-full text-lg font-bold shadow-xl shadow-slate-900/10 hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </motion.div>
    </section>
  )
}
