"use client"

import { motion } from 'framer-motion'
import { Brain, FileText, CheckCircle2 } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function AIAnalysisSection() {
  return (
    <section id="features" className="py-32 bg-[#020617] relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.15)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.15)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={spring}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#0ea5e9] text-xs font-bold tracking-widest uppercase mb-6">
              <Brain className="w-4 h-4" />
              <span>Contextual Understanding</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
              It doesn't just read.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-200">It comprehends.</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
              Unlike traditional OCR that just captures text, Clerkly understands the semantic meaning of your documents. It automatically identifies entities, validates data types, and flags anomalies.
            </p>
            <ul className="space-y-5">
              {[
                "Recognizes unstructured formats instantly",
                "Cross-validates dates, names, and amounts",
                "Learns your specific business logic over time"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center border border-[#0ea5e9]/50">
                    <CheckCircle2 className="w-3 h-3 text-[#0ea5e9]" />
                  </div>
                  <span className="text-slate-300 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ ...spring, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] md:aspect-square bg-slate-900/50 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-6 md:p-10 shadow-2xl relative overflow-hidden">
              {/* Paper Document */}
              <div className="w-[85%] bg-[#fafaf9] rounded-xl p-6 md:p-8 shadow-2xl rotate-[-2deg] absolute top-10 right-10">
                <div className="flex justify-between items-start border-b-2 border-slate-200 pb-3 mb-5">
                  <div>
                    <div className="text-lg font-black tracking-tight text-slate-900">INVOICE</div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase mt-1">#INV-2026-892</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Billed To</div>
                    <div className="text-sm font-semibold text-slate-800">Stark Industries</div>
                    <div className="text-xs text-slate-500">200 Park Ave, NY</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Amount</div>
                      <div className="text-xl font-black text-slate-800">$14,500.00</div>
                    </div>
                  </div>
                </div>
                {/* Scan Line Overlay */}
                <motion.div 
                  className="absolute inset-x-0 h-[2px] bg-[#0ea5e9] shadow-[0_0_15px_#0ea5e9]"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Extraction Glass Cards floating above */}
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-10 w-64 bg-slate-800/90 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl"
                initial={{ x: -20 }}
                whileInView={{ x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-widest uppercase">Extracted</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Vendor</div>
                    <div className="text-sm font-bold text-white mt-0.5">Stark Industries</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-emerald-500/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                    <div className="text-[10px] font-semibold text-emerald-400 uppercase">Amount Extracted</div>
                    <div className="text-lg font-black text-white mt-0.5">$14,500.00</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
