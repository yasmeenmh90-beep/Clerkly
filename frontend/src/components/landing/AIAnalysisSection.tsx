"use client"

import { motion } from 'framer-motion'
import { Check, Brain } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function AIAnalysisSection() {
  return (
    <section className="py-32 bg-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#f0f9ff_0%,transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={spring}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm">
            <Brain className="w-3.5 h-3.5 text-[#0ea5e9]" />
            <span>Document Understanding</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            AI that understands <br /> the paperwork.
          </h2>
          <p className="text-xl text-slate-500 leading-relaxed max-w-lg mb-10 font-medium">
            Clerkly identifies actions and prepares work, turning unstructured PDFs and forms into structured data and clear next steps.
          </p>
          
          <ul className="space-y-5">
            {[
              "Automatic data extraction",
              "Deadline and date detection",
              "Signature requirement flagging",
              "Confidence indicators for accuracy"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                <div className="w-6 h-6 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 text-[#0ea5e9]" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.2 }}
          className="relative"
        >
          {/* Premium Glass Document Visual */}
          <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[2rem] bg-slate-50/50 border border-slate-100 shadow-lg flex items-center justify-center p-8 overflow-visible">
            
            {/* Document Base */}
            <div className="relative w-full max-w-sm h-full bg-white rounded-xl shadow-xl border border-slate-100 p-8 flex flex-col gap-4">
              <div className="text-[10px] font-bold text-slate-400 mb-2 tracking-wider">VENDOR AGREEMENT</div>
              <div className="h-4 w-2/3 bg-slate-200 rounded mb-4" />
              
              <div className="space-y-4">
                <div>
                  <div className="text-[8px] uppercase text-slate-400 mb-1">Parties</div>
                  <div className="h-3 w-full bg-slate-50 rounded mb-1" />
                  <div className="h-3 w-5/6 bg-slate-50 rounded" />
                </div>
                
                {/* Highlighted extraction field */}
                <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0ea5e9]" />
                  <div className="text-[9px] font-bold text-[#0ea5e9] uppercase mb-2 flex items-center gap-1.5">
                    <Brain className="w-3 h-3" />
                    Detected Obligation
                  </div>
                  <div className="h-3 w-3/4 bg-sky-100 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-sky-100 rounded" />
                </div>

                <div>
                  <div className="text-[8px] uppercase text-slate-400 mb-1">Signatures</div>
                  <div className="flex gap-4">
                    <div className="h-10 flex-1 border-b-2 border-slate-200 border-dashed" />
                    <div className="h-10 flex-1 border-b-2 border-slate-200 border-dashed" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Structured Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 md:-right-12 bottom-12 bg-white/80 backdrop-blur-2xl border border-white p-5 rounded-2xl shadow-2xl w-[240px]"
            >
              <div className="text-[10px] font-bold text-slate-400 mb-4 tracking-wider flex items-center justify-between">
                <span>STRUCTURED OUTPUT</span>
                <span className="text-[#0ea5e9]">99%</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wide mb-1">Action Required</div>
                  <div className="text-sm font-semibold text-slate-800">Sign Document</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wide mb-1">Assignee</div>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">LT</div>
                    Legal Team
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
