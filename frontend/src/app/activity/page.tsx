"use client"

import { motion } from "framer-motion"
import { Upload, CheckCircle2, FileWarning, IndianRupee, Play, Clock, Search, Loader2, AlertCircle } from "lucide-react"
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

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getActivity()
        setActivities(data)
      } catch (err) {
        setError("Unable to load activity. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivity()
  }, [])

  const filteredActivities = activities.filter(activity => 
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    activity.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p>Loading activity...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-danger space-y-4">
        <AlertCircle className="w-10 h-10" />
        <p className="font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 mt-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80">Try Again</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">System Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">A timeline of all events and actions</p>
        </div>
        
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search activity..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary transition-all text-foreground"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No activity found matching your search.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border/60 ml-4 md:ml-8 space-y-10 py-4">
            {filteredActivities.map((activity, i) => {
              const Icon = typeIcons[activity.type] || Play;
              const colorClass = typeColors[activity.type] || "bg-accent text-foreground border-border";
              
              return (
                <motion.div 
                  key={activity.activity_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="relative pl-8 md:pl-10 group"
                >
                  <div className={`absolute -left-[21px] top-0 w-10 h-10 rounded-full flex items-center justify-center border-2 bg-card ${colorClass} group-hover:scale-110 shadow-sm transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex flex-col pt-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4 mb-2">
                      <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{activity.title}</h4>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/50 self-start sm:self-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activity.timestamp}
                      </span>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm text-muted-foreground leading-relaxed">
                      {activity.description}
                    </div>
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

