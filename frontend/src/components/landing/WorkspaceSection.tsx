"use client"

import { motion } from 'framer-motion'
import { LayoutDashboard, CheckSquare, FileText, Eye, Clock } from 'lucide-react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function WorkspaceSection() {
  const docs = [
    { name: "Q3 Marketing Retainer", type: "Contract", status: "Approved", statusColor: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { name: "W-4 Form - J. Smith", type: "Tax Form", status: "Needs Review", statusColor: "bg-amber-100 text-amber-700 border-amber-200" },
    { name: "Business Registration", type: "Legal", status: "Processing", statusColor: "bg-sky-100 text-sky-700 border-sky-200" },
    { name: "AWS Invoice Aug 2026", type: "Invoice", status: "Approved", statusColor: "bg-emerald-100 text-emerald-700 border-emerald-200" }
  ]

  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={spring}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold tracking-widest uppercase mb-6">
            <LayoutDashboard className="w-4 h-4" />
            <span>Unified Workspace</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
            Your entire operation, <br className="hidden md:block" />
            <span className="text-[#0ea5e9]">beautifully organized.</span>
          </h2>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
          className="relative max-w-5xl mx-auto"
          style={{ perspective: "2000px" }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Window Chrome */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="bg-white px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-400 w-64 shadow-sm flex items-center gap-2">
                <LayoutDashboard className="w-3 h-3" />
                clerkly.app/dashboard
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 hidden md:block min-h-[400px]">
                <div className="font-black text-slate-900 mb-8 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#0ea5e9] flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  Clerkly
                </div>
                <div className="space-y-1">
                  {['Overview', 'Documents', 'Approvals', 'Settings'].map((item, i) => (
                    <div key={item} className={`px-4 py-2 rounded-lg text-sm font-bold ${i === 1 ? 'bg-white shadow-sm border border-slate-200 text-[#0ea5e9]' : 'text-slate-500 hover:text-slate-900 cursor-pointer'}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Area */}
              <div className="flex-1 p-6 md:p-8 bg-white">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Recent Documents</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">4 documents processed today.</p>
                  </div>
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
                    Upload New
                  </button>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-6 md:col-span-5">Document</div>
                    <div className="col-span-3 hidden md:block">Type</div>
                    <div className="col-span-6 md:col-span-3">Status</div>
                    <div className="col-span-1 hidden md:block">Action</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {docs.map((doc, i) => (
                      <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-indigo-500" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{doc.name}</span>
                        </div>
                        <div className="col-span-3 hidden md:block">
                          <span className="text-sm font-medium text-slate-500">{doc.type}</span>
                        </div>
                        <div className="col-span-6 md:col-span-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${doc.statusColor}`}>
                            {doc.status}
                          </span>
                        </div>
                        <div className="col-span-1 hidden md:block">
                          <Eye className="w-4 h-4 text-slate-300 group-hover:text-[#0ea5e9] transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative gradients around the mockup */}
          <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 blur-2xl -z-10 rounded-3xl" />
        </motion.div>
      </div>
    </section>
  )
}
