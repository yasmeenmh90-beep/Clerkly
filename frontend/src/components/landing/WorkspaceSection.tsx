"use client"

import { motion } from 'framer-motion'
import { FileText, Upload, MoreHorizontal, Shield, Clock, Search } from 'lucide-react'

export default function WorkspaceSection() {
  const docs = [
    { name: 'Q3 Marketing Retainer', type: 'Contract', status: 'Approved', statusClass: 'bg-green-500/10 text-green-600 dark:text-green-400', conf: '99%', date: 'Today, 9:41 AM' },
    { name: 'W-4 Form - J. Smith', type: 'Tax Form', status: 'Processing', statusClass: 'bg-primary/10 text-primary', conf: '-', date: 'Today, 9:15 AM' },
    { name: 'Business Registration', type: 'Legal', status: 'Needs Review', statusClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', conf: '82%', date: 'Today, 8:30 AM' },
    { name: 'Vendor Agreement', type: 'Contract', status: 'Approved', statusClass: 'bg-green-500/10 text-green-600 dark:text-green-400', conf: '98%', date: 'Yesterday' },
    { name: 'Insurance Certificate', type: 'Certificate', status: 'Approved', statusClass: 'bg-green-500/10 text-green-600 dark:text-green-400', conf: '95%', date: 'Yesterday' },
  ]

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Text */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }}>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-6 leading-tight">
              Your paperwork,<br /><span className="text-muted-foreground">all in one place</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Organize, track, and manage all your important documents in a beautiful, intelligent workspace.
            </p>
            <ul className="space-y-3 mb-8">
              {['Real-time processing status', 'Smart organization & search', 'Secure cloud storage', 'Team collaboration'].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    {[Clock, Search, Shield, FileText][i] && (() => { const Icon = [Clock, Search, Shield, FileText][i]; return <Icon className="w-3 h-3 text-primary" />; })()}
                  </div>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <a href="#" className="inline-flex items-center gap-1 text-sm font-bold text-foreground border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors">Explore dashboard →</a>
          </motion.div>

          {/* Right Dashboard Mockup */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: 0.2 }}>
            <div className="glass-surface rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary flex items-center justify-center"><FileText className="w-3 h-3 text-white" /></div>
                  <span className="font-bold text-sm text-foreground">Clerkly</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Documents</span>
                  <button className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                </div>
              </div>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-6 py-3">Document</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Confidence</th>
                      <th className="px-6 py-3">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {docs.map((doc, i) => (
                      <tr key={i} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-3.5 text-sm font-semibold text-foreground">{doc.name}</td>
                        <td className="px-6 py-3.5 text-xs text-muted-foreground">{doc.type}</td>
                        <td className="px-6 py-3.5"><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${doc.statusClass}`}>{doc.status}</span></td>
                        <td className="px-6 py-3.5 text-xs font-bold text-foreground">{doc.conf}</td>
                        <td className="px-6 py-3.5 text-xs text-muted-foreground">{doc.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
