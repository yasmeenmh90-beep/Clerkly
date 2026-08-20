"use client"

import { motion } from 'framer-motion'
import { Lock, FileBadge, EyeOff, ShieldCheck } from 'lucide-react'

export default function SecuritySection() {
  const pillars = [
    { title: 'Bank-level encryption', desc: 'AES-256 encryption at rest and TLS 1.3 in transit.', icon: Lock },
    { title: 'SOC 2 Type II', desc: 'Compliant with the highest security standards.', icon: FileBadge },
    { title: 'Privacy by design', desc: 'Your data is never used to train our AI.', icon: EyeOff },
    { title: 'Granular permissions', desc: 'Control who can access what, even in the field.', icon: ShieldCheck },
  ]

  return (
    <section id="security" className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-3">Security you can trust</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-4">Enterprise-grade security</h2>
          <p className="text-base text-muted-foreground">Your documents are encrypted, protected, and never used to train our AI.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.1 }} className="glass-surface rounded-2xl p-6">
              <p.icon className="w-5 h-5 text-muted-foreground mb-4" />
              <h3 className="text-sm font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
