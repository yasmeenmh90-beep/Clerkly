"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function FinalCTA() {
  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={spring}
          className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-slate-800 shadow-2xl"
        >
          {/* Subtle Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1/2 bg-[#0ea5e9]/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
              Ready to automate <br /> your paperwork?
            </h2>
            <p className="text-xl text-slate-400 font-medium mb-10 max-w-2xl mx-auto">
              Join the companies saving hundreds of hours every month by letting Clerkly handle the data entry.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="bg-[#0ea5e9] text-white px-10 py-4 rounded-full font-bold shadow-[0_0_40px_-10px_#0ea5e9] hover:bg-sky-400 transition-all flex items-center gap-2 text-lg hover:scale-105">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-white/5 backdrop-blur-md text-white px-10 py-4 rounded-full font-bold border border-white/10 hover:bg-white/10 transition-all text-lg hover:scale-105">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
