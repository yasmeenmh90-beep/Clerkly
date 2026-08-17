"use client"

import { TaskStatusBadge, PriorityBadge } from "../ui/badges"
import { motion } from "framer-motion"
import { Calendar, AlertCircle, ArrowRight, Loader2, SearchX } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getTasks } from "@/lib/api"
import { Task } from "@/types"

import { TaskModal } from "./TaskModal"

export function UpcomingDeadlines({ searchQuery }: { searchQuery?: string }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const data = await getTasks()
        let upcoming = data
          .filter(t => t.status !== "completed")
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        
        if (searchQuery) {
          upcoming = upcoming.filter(t => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.document_type.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        
        setTasks(upcoming)
      } catch (err) {
        console.error("Failed to load tasks", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasks()
    
    window.addEventListener("task-updated", fetchTasks)
    return () => window.removeEventListener("task-updated", fetchTasks)
  }, [searchQuery])

  return (
    <>
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-border flex justify-between items-center bg-muted/10">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Upcoming Deadlines</h2>
          <p className="text-xs text-muted-foreground mt-1">Tasks approaching their due date</p>
        </div>
        <Link href="/tasks" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="flex-1 relative min-h-[200px] p-5">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3">
              {searchQuery ? <SearchX className="w-5 h-5 text-muted-foreground opacity-50" /> : <Calendar className="w-5 h-5 text-muted-foreground opacity-50" />}
            </div>
            <p className="text-sm font-medium text-foreground">{searchQuery ? "No matching deadlines" : "No upcoming deadlines"}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{searchQuery ? "Try a different search term" : "You have plenty of time."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.slice(0, 4).map((task, i) => {
              const isUrgent = new Date(task.deadline).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000;
              return (
                <motion.div 
                  key={task.task_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUrgent ? 'bg-danger/10 text-danger' : 'bg-muted text-muted-foreground'}`}>
                      {isUrgent ? <AlertCircle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{task.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.document_type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-semibold ${isUrgent ? 'text-danger' : 'text-foreground'}`}>
                      Due {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
    
    <TaskModal 
      task={selectedTask} 
      onClose={() => setSelectedTask(null)} 
    />
    </>
  )
}
