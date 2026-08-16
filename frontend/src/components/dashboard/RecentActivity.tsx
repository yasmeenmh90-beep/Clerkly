"use client"

import { mockActivities } from "@/mock/data"
import { motion } from "framer-motion"
import { Upload, CheckCircle2, FileWarning, IndianRupee, Play } from "lucide-react"

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

export function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-border bg-muted/10">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Recent Activity</h2>
        <p className="text-xs text-muted-foreground mt-1">Latest system events</p>
      </div>
      
      <div className="p-5 flex-1">
        <div className="relative border-l border-border/60 ml-3 space-y-6 pt-2">
          {mockActivities.map((activity, i) => {
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
      </div>
    </div>
  )
}
