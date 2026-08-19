"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { CheckSquare, Clock, FileWarning, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getTasks, getDocuments } from "@/lib/api"

function Counter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    
    let duration = 800; // ms
    let startTime: number | null = null;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (end - start) * ease);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
}

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
    
    window.addEventListener("task-updated", fetchData)
    return () => window.removeEventListener("task-updated", fetchData)
  }, [])

  const cards = [
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: FileWarning, color: "text-warning", gradient: "from-warning/20 to-warning/5", change: "Requires your review" },
    { title: "Active Tasks", value: stats.activeTasks, icon: Clock, color: "text-primary", gradient: "from-primary/20 to-primary/5", change: "Currently in progress" },
    { title: "Documents Processing", value: stats.docsProcessing, icon: CheckSquare, color: "text-foreground", gradient: "from-foreground/20 to-foreground/5", change: "AI is analyzing" },
    { title: "Completed Tasks", value: stats.completedTasks, icon: CheckCircle2, color: "text-success", gradient: "from-success/20 to-success/5", change: "Last 7 days" }
  ]

  const springTransition: any = { type: "spring", stiffness: 260, damping: 20 }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={springTransition}
          className="bg-card border border-border/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 group relative overflow-hidden h-32 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isLoading ? (
            <div className="h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-24 h-4 bg-muted/60 animate-pulse rounded"></div>
                <div className="w-8 h-8 bg-muted/60 animate-pulse rounded-lg"></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-12 h-8 bg-muted/60 animate-pulse rounded"></div>
                <div className="w-32 h-3 bg-muted/60 animate-pulse rounded"></div>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={springTransition}
              className="h-full flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient} transition-transform group-hover:scale-110`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-semibold text-foreground tracking-tight">
                  <Counter value={card.value} />
                </span>
                <span className="text-xs text-muted-foreground mt-2">{card.change}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
