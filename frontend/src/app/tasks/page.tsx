"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { mockTasks } from "@/mock/data"
import { Task, TaskStatus, TaskPriority } from "@/types"
import { TaskStatusBadge, PriorityBadge } from "@/components/ui/badges"
import { Search, Filter, FileText, IndianRupee, PenTool, X, Clock } from "lucide-react"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.document_type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status: newStatus } : t))
    if (selectedTask?.task_id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary transition-all text-foreground"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary text-foreground cursor-pointer flex-1 sm:flex-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_approval">Waiting Approval</option>
            <option value="completed">Completed</option>
          </select>

          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="h-10 px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary text-foreground cursor-pointer flex-1 sm:flex-none"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl"
            >
              <Filter className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No tasks found matching your filters.</p>
            </motion.div>
          )}
          
          {filteredTasks.map((task, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              key={task.task_id}
              onClick={() => setSelectedTask(task)}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 cursor-pointer transition-all shadow-sm hover:shadow-md flex flex-col group"
            >
              <div className="flex justify-between items-start mb-3">
                <TaskStatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{task.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{task.document_type}</p>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Due {new Date(task.deadline).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2">
                  {task.requires_payment && <IndianRupee className="w-4 h-4 text-warning" title="Requires Payment" />}
                  {task.requires_signature && <PenTool className="w-4 h-4 text-primary" title="Requires Signature" />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex justify-between items-start relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
                   <div className="h-full bg-primary w-1/3" />
                </div>
                <div>
                  <div className="flex gap-2 mb-3 mt-2">
                    <TaskStatusBadge status={selectedTask.status} />
                    <PriorityBadge priority={selectedTask.priority} />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedTask.title}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <FileText className="w-4 h-4" /> {selectedTask.document_type}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Created At</p>
                    <p className="text-sm font-medium">{new Date(selectedTask.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(selectedTask.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {(selectedTask.requires_payment || selectedTask.requires_signature) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Requirements</h4>
                    {selectedTask.requires_payment && (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5 text-warning-foreground">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-5 h-5" />
                          <span className="text-sm font-medium">Payment Required</span>
                        </div>
                        <span className="font-bold">₹{selectedTask.amount}</span>
                      </div>
                    )}
                    {selectedTask.requires_signature && (
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5 text-primary">
                        <PenTool className="w-5 h-5" />
                        <span className="text-sm font-medium">Signature Required</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground">Change Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {(["pending", "in_progress", "waiting_approval", "completed"] as TaskStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedTask.task_id, status)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                          selectedTask.status === status 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-card text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
