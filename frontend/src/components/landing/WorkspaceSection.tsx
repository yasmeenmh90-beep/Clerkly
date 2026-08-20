"use client"

import { motion } from 'framer-motion'
import { LayoutDashboard, CheckSquare, FileText, Eye, Clock } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function WorkspaceSection() {
  return (
    <section id="features" className="py-32 max-w-7xl mx-auto px-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={spring}
        className="text-center mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
          Everything under control.
        </h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          A premium workspace that organizes Tasks, Documents, Approvals, and Deadlines into one calm environment.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 60, rotateX: 10, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ ...spring, damping: 25 }}
        style={{ perspective: "1000px" }}
        className="w-full max-w-5xl mx-auto"
      >
        {/* Workspace Mockup */}
        <div className="w-full bg-white/60 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[500px]">
          
          {/* Sidebar Mock */}
          <div className="w-full md:w-64 bg-slate-50/50 backdrop-blur-md border-r border-slate-100 p-6 flex flex-col gap-8 shrink-0">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-7 h-7 rounded-lg bg-[#0ea5e9] flex items-center justify-center shadow-sm">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="font-bold text-sm tracking-tight text-slate-900">Clerkly</div>
            </div>
            <div className="space-y-1">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: CheckSquare, label: "Tasks" },
                { icon: FileText, label: "Documents" },
                { icon: Eye, label: "Approvals" }
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active ? 'bg-white shadow-sm border border-slate-100 text-[#0ea5e9]' : 'text-slate-500 hover:bg-slate-100/50'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main Area Mock */}
          <div className="flex-1 p-6 md:p-10 bg-[#f8fafc]/50 flex flex-col gap-8 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-900">Recent Approvals</h3>
                <p className="text-sm text-slate-500 font-medium">You have 3 items requiring your attention.</p>
              </div>
              <button className="text-sm text-[#0ea5e9] font-semibold hover:underline bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                View all
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "Q3 Marketing Retainer", type: "MSA Document", urgency: "Needs signature today", tag: "Review", color: "amber" },
                { title: "Employee Onboarding: J. Smith", type: "W-4 Form", urgency: "Due in 2 days", tag: "Approve", color: "sky" },
                { title: "Software License Renewal", type: "Invoice", urgency: "Due next week", tag: "Payment", color: "slate" }
              ].map((item, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-default group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 mb-1">{item.title}</div>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                        <span>{item.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className={`flex items-center gap-1.5 ${i === 0 ? 'text-amber-600' : ''}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {item.urgency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 bg-${item.color}-50 border border-${item.color}-100 text-${item.color}-600 text-xs font-bold rounded-xl whitespace-nowrap self-start sm:self-auto`}>
                    {item.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
