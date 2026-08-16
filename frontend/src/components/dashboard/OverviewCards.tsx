"use client"

import { motion } from "framer-motion"
import { CheckSquare, Clock, FileWarning, CheckCircle2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getTasks } from "@/lib/api"

export function OverviewCards() {
  const [stats, setStats] = useState({ total: 0, pending: 0, waitingApproval: 0, completed: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const tasks = await getTasks()
        setStats({
          total: tasks.length,
          pending: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
          waitingApproval: tasks.filter(t => t.status === 'waiting_approval').length,
          completed: tasks.filter(t => t.status === 'completed').length,
        })
      } catch (err) {
        console.error("Failed to load stats", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { title: "Total Tasks", value: stats.total, icon: CheckSquare, color: "text-primary", bg: "bg-primary/10", change: "+2 from yesterday" },
    { title: "Pending", value: stats.pending, icon: Clock, color: "text-warning", bg: "bg-warning/10", change: "Requires action" },
    { title: "Waiting Approval", value: stats.waitingApproval, icon: FileWarning, color: "text-foreground", bg: "bg-accent", change: "Blocked" },
    { title: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-success", bg: "bg-success/10", change: "This week" }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30 group relative overflow-hidden h-32"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
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
            </>
          )}
        </motion.div>
      ))}
    </div>
  )
}

