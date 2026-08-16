import { cn } from "@/lib/utils"
import { TaskStatus, TaskPriority } from "@/types"

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const styles = {
    pending: "bg-warning/10 text-warning border-warning/20",
    in_progress: "bg-primary/10 text-primary border-primary/20",
    waiting_approval: "bg-accent/50 text-accent-foreground border-border",
    completed: "bg-success/10 text-success border-success/20",
  }
  
  const labels = {
    pending: "Pending",
    in_progress: "In Progress",
    waiting_approval: "Waiting Approval",
    completed: "Completed"
  }

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", styles[status])}>
      {labels[status]}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles = {
    low: "text-muted-foreground",
    medium: "text-warning",
    high: "text-danger"
  }
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-1.5 h-1.5 rounded-full", 
        priority === 'high' ? 'bg-danger' : 
        priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
      )} />
      <span className={cn("text-xs font-medium capitalize", styles[priority])}>
        {priority}
      </span>
    </div>
  )
}
