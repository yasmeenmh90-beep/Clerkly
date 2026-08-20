"use client"

import { motion } from 'framer-motion'
import { Upload, Brain, FileText, CheckSquare } from 'lucide-react'

export default function WorkflowSection() {
  const steps = [
    { num: '01', title: 'Upload', desc: 'Upload any document in seconds.', icon: Upload },
    { num: '02', title: 'Understand', desc: 'AI reads and understands your document.', icon: Brain },
    { num: '03', title: 'Extract', desc: 'Important data is extracted with high accuracy.', icon: FileText },
    { num: '04', title: 'Review & Approve', desc: 'Review the results and approve with confidence.', icon: CheckSquare },
  ]

  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} className="text-center mb-20">
          <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-3">How it works</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">From upload to approved in minutes</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.1 }} className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-xs font-bold text-primary tracking-widest uppercase mb-2">{step.num}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
