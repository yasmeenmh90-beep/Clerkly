"use client"

import { mockStats } from "@/mock/data"
import { motion } from "framer-motion"
import { CheckSquare, Clock, FileWarning, CheckCircle2 } from "lucide-react"

const cards = [
  { title: "Total Tasks", value: mockStats.total, icon: CheckSquare, color: "text-primary", bg: "bg-primary/10", change: "+2 from yesterday" },
  { title: "Pending", value: mockStats.pending, icon: Clock, color: "text-warning", bg: "bg-warning/10", change: "Requires action" },
  { title: "Waiting Approval", value: mockStats.waitingApproval, icon: FileWarning, color: "text-foreground", bg: "bg-accent", change: "Blocked" },
  { title: "Completed", value: mockStats.completed, icon: CheckCircle2, color: "text-success", bg: "bg-success/10", change: "This week" }
]

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
            <div className={`p-2 rounded-lg ${card.bg} transition-transform group-hover:scale-110`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-semibold text-foreground tracking-tight">{card.value}</span>
            <span className="text-xs text-muted-foreground mt-2">{card.change}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
