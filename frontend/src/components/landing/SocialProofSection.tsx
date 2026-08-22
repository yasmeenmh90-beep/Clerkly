"use client"

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function SocialProofSection() {
  const testimonials = [
    { quote: 'Clerkly has transformed how we handle contracts. What used to take hours now takes minutes.', author: 'Michael Chen', role: 'CEO, Stellar', avatar: 'M' },
    { quote: 'The accuracy is incredible. It just works, and our team loves how easy it is to use.', author: 'Sarah Johnson', role: 'VP Ops, Meridian', avatar: 'S' },
    { quote: 'Finally, an AI document tool that actually understands complex paperwork.', author: 'David Park', role: 'CTO, Archway', avatar: 'D' },
  ]

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Loved by teams worldwide</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.1 }} className="glass-surface rounded-2xl p-8">
              <div className="flex gap-0.5 mb-4">
                {[0,1,2,3,4].map(j => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-foreground font-medium leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                <div>
                  <div className="text-sm font-bold text-foreground">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
