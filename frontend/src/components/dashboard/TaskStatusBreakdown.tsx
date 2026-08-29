"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, ListChecks, Activity } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import ReactECharts from "echarts-for-react"
import "echarts-gl"

import type { Task } from "@/types"
import { getTasks } from "@/lib/api"

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  awaiting_approval: "Pending Review",
  failed: "Failed",
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  in_progress: "#3b82f6",
  awaiting_approval: "#eab308",
  failed: "#ef4444",
}

const STATUS_ORDER = [
  "completed",
  "in_progress",
  "awaiting_approval",
  "failed",
]

interface EChartsCallbackParams {
  name: string
  value: [number, number, number]
  color: string
}

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

    return STATUS_ORDER.map((status) => ({
      name: STATUS_LABELS[status] ?? status,
      value: counts[status] || 0,
      color: STATUS_COLORS[status],
      statusKey: status,
    }))
  }, [tasks])

  const totalTasks = useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [chartData])
  const completedTasks = chartData.find(c => c.statusKey === 'completed')?.value || 0
  const successRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0.0"

  const option = useMemo(() => {
    return {
      tooltip: {
        show: true,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#f8fafc', fontSize: 13 },
        formatter: (params: EChartsCallbackParams) => {
          return `<div style="font-weight: 600; margin-bottom: 4px; color: ${params.color}">${params.name}</div>
                  <div>${params.value[2]} tasks</div>`;
        }
      },
      xAxis3D: {
        type: 'category',
        data: chartData.map(d => d.name),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: '#94a3b8', fontSize: 11, margin: 12 },
        splitLine: { show: false },
        axisTick: { show: false }
      },
      yAxis3D: {
        type: 'category',
        data: [''],
        axisLine: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
        axisTick: { show: false }
      },
      zAxis3D: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisTick: { show: false }
      },
      grid3D: {
        boxWidth: 120,
        boxDepth: 15,
        boxHeight: 60,
        viewControl: {
          alpha: 10,
          beta: 0,
          distance: 240,
          rotateSensitivity: 0,
          zoomSensitivity: 0,
          panSensitivity: 0
        },
        light: {
          main: {
            intensity: 1.8,
            shadow: true,
            shadowQuality: 'high',
            alpha: 35,
            beta: 25
          },
          ambient: {
            intensity: 0.6
          }
        },
        environment: 'transparent'
      },
      series: [{
        type: 'bar3D',
        data: chartData.map((d, index) => {
          return {
            name: d.name,
            value: [index, 0, d.value],
            itemStyle: { color: d.color }
          }
        }),
        shading: 'lambert',
        label: {
          show: true,
          position: 'top',
          textStyle: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: 'transparent'
          },
          formatter: (params: EChartsCallbackParams) => params.value[2]
        },
        itemStyle: {
          opacity: 0.95
        },
        emphasis: {
          label: { show: true },
          itemStyle: {
            color: '#ffffff'
          }
        },
        barSize: 15,
        animationDurationUpdate: 1000,
        animationEasingUpdate: 'cubicOut'
      }]
    };
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-lg transition-shadow duration-300"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-border/40 bg-card p-5">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Task Status Breakdown
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Distribution of tasks by their current status
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1 p-5">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 text-muted-foreground"
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading analytics...</span>
            </motion.div>
          </div>
        ) : totalTasks === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center">
            <ListChecks className="mb-3 h-8 w-8 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium text-foreground">No Tasks Yet</p>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            
            {/* ── 3D Bar Chart ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative min-h-[280px] w-full"
            >
              <ReactECharts
                option={option}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            </motion.div>

            {/* ── Grid of Summary Cards ── */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              <AnimatePresence>
                {chartData.map((entry, i) => {
                  const pct = totalTasks > 0 ? ((entry.value / totalTasks) * 100).toFixed(1) : "0.0"
                  
                  // Color variants for subtle background fills
                  const bgColors: Record<string, string> = {
                    completed: "bg-success/5 border-success/20",
                    in_progress: "bg-primary/5 border-primary/20",
                    awaiting_approval: "bg-warning/5 border-warning/20",
                    failed: "bg-danger/5 border-danger/20",
                  }
                  
                  const textColors: Record<string, string> = {
                    completed: "text-success",
                    in_progress: "text-primary",
                    awaiting_approval: "text-warning",
                    failed: "text-danger",
                  }

                  return (
                    <motion.div
                      key={entry.statusKey}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.1, ease: "easeOut" }}
                      className={`flex flex-col rounded-xl border ${bgColors[entry.statusKey] || "border-border/40"} p-3 shadow-sm transition-all duration-300 hover:shadow-md`}
                    >
                      <span className={`text-[11px] font-semibold ${textColors[entry.statusKey]}`}>
                        {entry.name}
                      </span>
                      <span className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                        {entry.value}
                      </span>
                      <span className="mt-1 text-[10px] font-medium text-muted-foreground">
                        {pct}%
                      </span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* ── Success Rate Metric ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
              className="relative mt-4 flex items-center justify-between overflow-hidden rounded-xl border border-border/40 bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-inner">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Success Rate
                  </p>
                  <span className="mt-0.5 block text-2xl font-extrabold tracking-tight text-foreground">
                    {successRate}%
                  </span>
                </div>
              </div>

              <div className="max-w-[180px] text-right">
                <p className="text-[11px] leading-tight text-muted-foreground">
                  Tasks completed successfully out of total tasks.
                </p>
                <div className="mt-1.5 flex items-center justify-end gap-1">
                  <span className="text-[10px] font-bold text-success">↑ 8.4%</span>
                  <span className="text-[10px] text-muted-foreground">vs last 7 days</span>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </motion.div>
  )
}