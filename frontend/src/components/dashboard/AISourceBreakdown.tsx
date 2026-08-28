"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Cpu } from "lucide-react"
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import type { Task } from "@/types"
import { getTasks } from "@/lib/api"


const SOURCE_LABELS: Record<string, string> = {
  strands: "Amazon Bedrock",
  openai_fallback: "OpenAI (fallback)",
  deterministic_fallback: "Rule-based (fallback)",
}

const SOURCE_COLORS: Record<string, string> = {
  strands: "#22c55e",
  openai_fallback: "#3b82f6",
  deterministic_fallback: "#f59e0b",
}


export function AISourceBreakdown() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks(): Promise<void> {
      try {
        setIsLoading(true)
        const data = await getTasks({ page: 1, page_size: 100 })
        setTasks(data)
      } catch (error) {
        console.error("Failed to load AI source breakdown", error)
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
      if (!task.analysis_source) continue
      counts[task.analysis_source] =
        (counts[task.analysis_source] ?? 0) + 1
    }

    return Object.entries(counts).map(([source, count]) => ({
      name: SOURCE_LABELS[source] ?? source,
      value: count,
      color: SOURCE_COLORS[source] ?? "#94a3b8",
    }))
  }, [tasks])

  const totalAnalyzed = chartData.reduce(
    (sum, entry) => sum + entry.value,
    0,
  )

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/10 p-5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          AI Source Breakdown
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Which layer actually analyzed each document
        </p>
      </div>

      <div className="relative min-h-[240px] flex-1 p-5">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : totalAnalyzed === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <Cpu className="h-5 w-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No AI-analyzed tasks yet
            </p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              Upload a document or sync email to see this breakdown.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} task${value === 1 ? "" : "s"}`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}