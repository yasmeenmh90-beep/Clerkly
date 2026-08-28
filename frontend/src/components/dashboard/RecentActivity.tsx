"use client"

import { motion } from "framer-motion"
import { Upload, CheckCircle2, FileWarning, IndianRupee, Play, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getActivity } from "@/lib/api"
import { Activity } from "@/types"

const typeIcons = {
  document_uploaded: Upload,
  task_created: Play,
  approval_requested: FileWarning,
  payment_approved: IndianRupee,
  task_completed: CheckCircle2
}

const typeColors = {
  document_uploaded: "bg-primary/10 text-primary border-primary/20",
  task_created: "bg-accent text-foreground border-border",
  approval_requested: "bg-warning/10 text-warning border-warning/20",
  payment_approved: "bg-success/10 text-success border-success/20",
  task_completed: "bg-success/10 text-success border-success/20"
}

export function RecentActivity({ searchQuery }: { searchQuery?: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsLoading(true)
        const data = await getActivity()
        let filtered = data;
        if (searchQuery) {
          filtered = filtered.filter(a => 
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            a.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        setActivities(filtered)
      } catch (err) {
        console.error("Failed to load activities", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivity()
  }, [searchQuery])

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-border bg-muted/10">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Recent Activity</h2>
        <p className="text-xs text-muted-foreground mt-1">Latest system events</p>
      </div>
      
      <div className="p-5 flex-1 relative min-h-[200px] max-h-[420px] overflow-y-auto">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3">
              <Play className="w-5 h-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm font-medium text-foreground">{searchQuery ? "No matching activity" : "No recent activity"}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{searchQuery ? "Try a different search term" : "Things are quiet right now. Check back later."}</p>
          </div>
        ) : (
          <div className="relative border-l border-border/60 ml-3 space-y-6 pt-2">
            {activities.map((activity, i) => {
              const Icon = typeIcons[activity.type] || Play;
              const colorClass = typeColors[activity.type] || "bg-accent text-foreground border-border";
              
              return (
                <motion.div 
                  key={activity.activity_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="relative pl-6 group"
                >
                  <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full flex items-center justify-center border bg-card ${colorClass} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-sm font-medium text-foreground">{activity.title}</h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{activity.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

