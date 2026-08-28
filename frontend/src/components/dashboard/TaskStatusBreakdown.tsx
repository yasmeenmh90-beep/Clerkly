"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, ListChecks } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { Task } from "@/types"
import { getTasks } from "@/lib/api"


const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  awaiting_approval: "Awaiting Approval",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  failed: "Failed",
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#94a3b8",
  in_progress: "#3b82f6",
  awaiting_approval: "#f59e0b",
  approved: "#8b5cf6",
  completed: "#22c55e",
  rejected: "#ef4444",
  failed: "#dc2626",
}

const STATUS_ORDER = [
  "awaiting_approval",
  "approved",
  "in_progress",
  "completed",
  "rejected",
  "failed",
  "pending",
]


export function TaskStatusBreakdown() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks(): Promise<void> {
      try {
        setIsLoading(true)
        const data = await getTasks({ page: 1, page_size: 100 })
        setTasks(data)
      } catch (error) {
        console.error("Failed to load task status breakdown", error)
      } finally {
        setIsLoading(false)
      }
    }

    function handleTaskUpdate(): void {
      void fetchTasks()
    }

    void fetchTasks()

    window.addEventListener("task-updated", handleTaskUpdate)
    return () => {
      window.removeEventListener("task-updated", handleTaskUpdate)
    }
  }, [])

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const task of tasks) {
      counts[task.status] = (counts[task.status] ?? 0) + 1
    }

    return STATUS_ORDER.filter((status) => counts[status] > 0).map(
      (status) => ({
        name: STATUS_LABELS[status] ?? status,
        value: counts[status],
        color: STATUS_COLORS[status] ?? "#94a3b8",
      }),
    )
  }, [tasks])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/10 p-5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Task Status Breakdown
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Current snapshot across all tasks
        </p>
      </div>

      <div className="relative min-h-[240px] flex-1 p-5">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <ListChecks className="h-5 w-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No tasks yet
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: any) => [
                  `${value} task${value === 1 ? "" : "s"}`,
                  "",
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}