import type { TaskStatus } from "@/types"

import { cn } from "@/lib/utils"


const statusStyles: Record<TaskStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400",

  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",

  awaiting_approval:
    "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400",

  approved:
    "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400",

  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400",

  rejected:
    "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",

  failed:
    "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
}


const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  awaiting_approval: "Awaiting Approval",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  failed: "Failed",
}


interface TaskStatusBadgeProps {
  status: TaskStatus
  className?: string
}


export function TaskStatusBadge({
  status,
  className,
}: TaskStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  )
}