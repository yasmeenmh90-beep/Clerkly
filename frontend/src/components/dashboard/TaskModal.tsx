"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, FileText, Calendar, IndianRupee, PenTool, AlertCircle, Loader2 } from "lucide-react"
import { Task, TaskStatus } from "@/types"
import { TaskStatusBadge, PriorityBadge } from "../ui/badges"
import { updateTaskStatus } from "@/lib/api"
import { useState } from "react"

export function TaskModal({ task, onClose }: { task: Task | null, onClose: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!task) return null;

  const handleStatusChange = async (status: TaskStatus) => {
    try {
      setIsUpdating(true)
      await updateTaskStatus(task.task_id, status)
      onClose() // Close after update
    } catch (err) {
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-border flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TaskStatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{task.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">ID: {task.task_id}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all duration-200 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Document Type</span>
                <p className="text-sm font-medium text-foreground">{task.document_type}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Deadline</span>
                <p className="text-sm font-medium text-foreground">{new Date(task.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Requirements</h3>
              <div className="space-y-2">
                {task.requires_payment && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Payment Required</p>
                      <p className="text-xs text-muted-foreground">Amount: ₹{task.amount}</p>
                    </div>
                  </div>
                )}
                {task.requires_signature && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Signature Required</p>
                      <p className="text-xs text-muted-foreground">Awaiting your e-signature</p>
                    </div>
                  </div>
                )}
                {!task.requires_payment && !task.requires_signature && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">No special requirements for this task.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-muted/10 flex flex-wrap gap-3">
            {task.status !== "completed" && (
              <button 
                onClick={() => handleStatusChange("completed")}
                disabled={isUpdating}
                className="flex-1 min-w-[120px] h-10 bg-success hover:bg-success/90 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Mark as Completed
              </button>
            )}
            
            {task.status === "pending" && (
              <button 
                onClick={() => handleStatusChange("in_progress")}
                disabled={isUpdating}
                className="flex-1 min-w-[120px] h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Start Task
              </button>
            )}
            
            <button 
              onClick={() => confirm("Are you sure you want to delete this task?") && onClose()}
              disabled={isUpdating}
              className="px-6 h-10 border border-danger/30 text-danger hover:bg-danger/10 rounded-lg font-medium text-sm transition-colors flex items-center justify-center ml-auto"
            >
              Delete
            </button>
            <button 
              onClick={() => alert("Edit task functionality coming soon")}
              disabled={isUpdating}
              className="px-6 h-10 border border-border hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            >
              Edit
            </button>
            <button 
              onClick={onClose}
              disabled={isUpdating}
              className="px-6 h-10 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
