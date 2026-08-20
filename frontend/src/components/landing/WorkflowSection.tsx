"use client"

import { motion } from 'framer-motion'
import { Upload, Brain, Eye, CheckCircle2 } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function WorkflowSection() {
  return (
    <section id="how-it-works" className="py-32 max-w-7xl mx-auto px-6">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={spring}
        className="text-center mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
          From paperwork to done.
        </h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          A simple workflow that keeps you in control while AI does the heavy lifting.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { step: "01", title: "Upload", desc: "Give Clerkly the document.", icon: Upload },
          { step: "02", title: "Understand", desc: "AI extracts what matters.", icon: Brain },
          { step: "03", title: "Review", desc: "Review important information before action.", icon: Eye },
          { step: "04", title: "Complete", desc: "Clerkly keeps the workflow moving.", icon: CheckCircle2 }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ...spring, delay: i * 0.1 }}
            className="h-full"
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-slate-100 h-full hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-[80px] font-bold leading-none tracking-tighter select-none pointer-events-none group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              
              <div className="w-14 h-14 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9] mb-8">
                <item.icon className="w-6 h-6" />
              </div>
              
              <h3 className="font-semibold text-xl text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
