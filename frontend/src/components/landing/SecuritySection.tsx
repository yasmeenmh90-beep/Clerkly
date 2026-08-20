"use client"

import { motion } from 'framer-motion'
import { Shield, Lock, Fingerprint, Activity } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function SecuritySection() {
  return (
    <section id="security" className="py-32 bg-[#f1f5f9] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={spring}
        >
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-100">
            <Shield className="w-8 h-8 text-slate-700" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Your paperwork stays protected.
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-20 font-medium">
            Security is built into every layer of Clerkly. Calm, trustworthy, and fully auditable.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { icon: Lock, title: "Encrypted", desc: "Data protected at rest and in transit using enterprise-grade standards." },
              { icon: Fingerprint, title: "Private", desc: "Your documents are never shared and remain strictly under your control." },
              { icon: Activity, title: "Auditable", desc: "A complete, immutable history of every action and approval." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
