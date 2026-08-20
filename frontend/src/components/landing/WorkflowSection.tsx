"use client"

import { motion } from 'framer-motion'
import { Upload, Brain, FileText, CheckCircle2 } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function WorkflowSection() {
  const steps = [
    { num: '01', title: 'Upload', desc: 'Securely ingest documents in any format.', icon: Upload, color: 'text-indigo-500' },
    { num: '02', title: 'Understand', desc: 'Clerkly AI scans and classifies unstructured data.', icon: Brain, color: 'text-[#0ea5e9]' },
    { num: '03', title: 'Extract', desc: 'Key fields are digitized with 99% accuracy.', icon: FileText, color: 'text-blue-500' },
    { num: '04', title: 'Approve', desc: 'Review exceptions and sync to your systems.', icon: CheckCircle2, color: 'text-emerald-500' },
  ]

  return (
    <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
            The intelligent pipeline.
          </h2>
          <p className="text-xl text-slate-500 font-medium">
            From physical paper to structured database in seconds, not hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ ...spring, delay: i * 0.1 }}
              className="relative group cursor-default"
            >
              {/* Connector Line (Desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-[2px] bg-gradient-to-r from-slate-100 to-transparent -z-10" />
              )}
              
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 h-full transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] group-hover:-translate-y-2 group-hover:bg-white relative overflow-hidden">
                {/* Background Number */}
                <div className="absolute -right-4 -top-8 text-[120px] font-black text-slate-900/[0.03] select-none group-hover:text-[#0ea5e9]/5 transition-colors duration-500">
                  {step.num}
                </div>

                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:shadow-md transition-all duration-500 relative z-10">
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed relative z-10">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
