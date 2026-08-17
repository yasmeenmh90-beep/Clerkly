"use client"

import { motion } from "framer-motion"
import { CheckSquare, Clock, FileWarning, CheckCircle2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getTasks, getDocuments } from "@/lib/api"

export function OverviewCards() {
  const [stats, setStats] = useState({ pendingApprovals: 0, activeTasks: 0, docsProcessing: 0, completedTasks: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [tasks, docs] = await Promise.all([getTasks(), getDocuments()])
        
        setStats({
          pendingApprovals: tasks.filter(t => t.status === 'waiting_approval').length,
          activeTasks: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
          docsProcessing: docs.filter(d => d.status === 'processing').length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
        })
      } catch (err) {
        console.error("Failed to load stats", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
    
    // Listen to updates from TaskModal
    window.addEventListener("task-updated", fetchData)
    return () => window.removeEventListener("task-updated", fetchData)
  }, [])

  const cards = [
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: FileWarning, color: "text-warning", bg: "bg-warning/10", change: "Requires your review" },
    { title: "Active Tasks", value: stats.activeTasks, icon: Clock, color: "text-primary", bg: "bg-primary/10", change: "Currently in progress" },
    { title: "Documents Processing", value: stats.docsProcessing, icon: CheckSquare, color: "text-foreground", bg: "bg-accent", change: "AI is analyzing" },
    { title: "Completed Tasks", value: stats.completedTasks, icon: CheckCircle2, color: "text-success", bg: "bg-success/10", change: "Last 7 days" }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="bg-card border border-border/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 group relative overflow-hidden h-32 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

