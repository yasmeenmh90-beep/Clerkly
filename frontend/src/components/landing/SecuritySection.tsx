"use client"

import { motion } from 'framer-motion'
import { Lock, Fingerprint, Activity, Key } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function SecuritySection() {
  const pillars = [
    {
      title: "Bank-Grade Encryption",
      desc: "AES-256 encryption at rest and TLS 1.3 in transit. Your documents never leave our secure VPC.",
      icon: Lock,
    },
    {
      title: "Private by Design",
      desc: "Our AI models do not train on your proprietary data. Your workflows remain strictly isolated.",
      icon: Fingerprint,
    },
    {
      title: "Granular Control",
      desc: "Role-based access control (RBAC), SSO integration, and detailed audit logging for compliance.",
      icon: Key,
    }
  ]

  return (
    <section id="security" className="py-32 bg-[#0a0f24] relative overflow-hidden text-white">
      {/* Abstract Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9]/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={spring}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
            Enterprise security, <br />
            <span className="text-indigo-400">built into the foundation.</span>
          </h2>
          <p className="text-lg text-indigo-200/60 font-medium">
            We treat your documents with the highest level of security and compliance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ ...spring, delay: i * 0.1 }}
              className="bg-[#0f1530] border border-indigo-500/20 rounded-3xl p-8 hover:bg-[#131a3a] transition-colors duration-500 group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#0ea5e9]/50 transition-all duration-500">
                <pillar.icon className="w-5 h-5 text-indigo-400 group-hover:text-[#0ea5e9] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
              <p className="text-indigo-200/60 leading-relaxed font-medium">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
