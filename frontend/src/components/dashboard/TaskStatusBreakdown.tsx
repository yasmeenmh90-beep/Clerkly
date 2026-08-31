"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, ListChecks, Loader2 } from "lucide-react"
import ReactECharts from "echarts-for-react"
import * as echarts from "echarts/core"

import type { Task } from "@/types"
import { getTasks } from "@/lib/api"

// ── Status metadata ────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  awaiting_approval: "Pending Review",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  failed: "Failed",
}

const STATUS_COLORS: Record<string, { base: string; bright: string; deep: string; glow: string }> = {
  completed: {
    base: "#10b981",
    bright: "#34d399",
    deep: "#059669",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  in_progress: {
    base: "#3b82f6",
    bright: "#60a5fa",
    deep: "#2563eb",
    glow: "rgba(59, 130, 246, 0.4)",
  },
  awaiting_approval: {
    base: "#f59e0b",
    bright: "#fbbf24",
    deep: "#d97706",
    glow: "rgba(245, 158, 11, 0.4)",
  },
  failed: {
    base: "#ef4444",
    bright: "#f87171",
    deep: "#dc2626",
    glow: "rgba(239, 68, 68, 0.4)",
  },
}

const STATUS_ORDER = [
  "completed",
  "in_progress",
  "awaiting_approval",
  "failed",
]

// ── Types ──────────────────────────────────────────────────────────

interface StatusEntry {
  name: string
  value: number
  statusKey: string
  colors: { base: string; bright: string; deep: string; glow: string }
}

interface EChartsBarTooltipParams {
  name: string
  value: number
  color: string
  marker: string
}

// ── Component ──────────────────────────────────────────────────────

export function TaskStatusBreakdown() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getTasks({ page: 1, page_size: 100 })
      setTasks(data)
    } catch (error) {
      console.error("Failed to load task status breakdown", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTasks()

    const handler = () => void fetchTasks()
    window.addEventListener("task-updated", handler)
    return () => window.removeEventListener("task-updated", handler)
  }, [fetchTasks])

  // ── Computed data ──

  const chartData = useMemo<StatusEntry[]>(() => {
    const counts: Record<string, number> = {}

    for (const task of tasks) {
      counts[task.status] = (counts[task.status] ?? 0) + 1
    }

    const defaultColors = { base: "#94a3b8", bright: "#cbd5e1", deep: "#64748b", glow: "rgba(148,163,184,0.3)" }

    // Always show the 4 main statuses even if zero
    return STATUS_ORDER.map((status) => ({
      name: STATUS_LABELS[status] ?? status,
      value: counts[status] ?? 0,
      statusKey: status,
      colors: STATUS_COLORS[status] ?? defaultColors,
    }))
  }, [tasks])

  const totalTasks = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.value, 0),
    [chartData],
  )

  const completedEntry = useMemo(
    () => chartData.find((c) => c.statusKey === "completed"),
    [chartData],
  )

  const successRate = useMemo(() => {
    if (totalTasks === 0 || !completedEntry) return "0.0"
    return ((completedEntry.value / totalTasks) * 100).toFixed(1)
  }, [totalTasks, completedEntry])

  // ── ECharts option ──

  const echartsOption = useMemo(() => {
    const categories = chartData.map((d) => d.name)

    // Main bars with gradient
    const barData = chartData.map((entry) => ({
      value: entry.value,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: entry.colors.bright },
          { offset: 0.7, color: entry.colors.base },
          { offset: 1, color: entry.colors.deep },
        ]),
        borderRadius: [4, 4, 0, 0],
        shadowBlur: entry.value > 0 ? 10 : 0,
        shadowColor: entry.value > 0 ? entry.colors.glow : "transparent",
        shadowOffsetY: 4,
      },
    }))

    // Shadow bars behind main bars (slightly wider, darker) for depth
    const shadowBarData = chartData.map((entry) => ({
      value: entry.value > 0 ? entry.value : 0,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(0,0,0,0.15)" },
          { offset: 1, color: "rgba(0,0,0,0.05)" },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
    }))

    return {
      tooltip: {
        trigger: "axis" as const,
        axisPointer: {
          type: "shadow" as const,
          shadowStyle: {
            color: "rgba(255,255,255,0.03)",
          },
        },
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          color: "#f1f5f9",
          fontSize: 13,
          fontFamily: "inherit",
        },
        formatter: (params: EChartsBarTooltipParams[]) => {
          // params is an array for axis trigger; first item is shadow, second is main bar
          const mainParam = params[1] ?? params[0]
          if (!mainParam) return ""
          const pct = totalTasks > 0 ? ((mainParam.value / totalTasks) * 100).toFixed(1) : "0.0"
          return `<div style="font-weight:600;margin-bottom:6px;font-size:14px;color:${mainParam.color}">${mainParam.name}</div>
                  <div style="color:#cbd5e1;font-size:13px">${mainParam.value} task${mainParam.value === 1 ? "" : "s"} · <b style="color:#f1f5f9">${pct}%</b></div>`
        },
        extraCssText: "border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.4);backdrop-filter:blur(8px);",
      },
      grid: {
        left: 12,
        right: 16,
        top: 36,
        bottom: 32,
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: categories,
        axisLine: {
          lineStyle: { color: "rgba(255,255,255,0.06)" },
        },
        axisTick: { show: false },
        axisLabel: {
          color: "#94a3b8",
          fontSize: 11,
          fontWeight: 500,
          margin: 12,
          fontFamily: "inherit",
        },
      },
      yAxis: {
        type: "value" as const,
        splitLine: {
          lineStyle: { color: "rgba(255,255,255,0.04)", type: "dashed" as const },
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
          fontFamily: "inherit",
        },
      },
      series: [
        // Shadow / depth layer
        {
          type: "bar" as const,
          data: shadowBarData,
          barWidth: "38%",
          barGap: "-100%", // overlap with main bar
          silent: true,
          animation: false,
          z: 1,
        },
        // Main bars
        {
          type: "bar" as const,
          data: barData,
          barWidth: "32%",
          label: {
            show: true,
            position: "top" as const,
            color: "#e2e8f0",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "inherit",
            formatter: (params: { value: number }) => {
              return String(params.value)
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: "rgba(0,0,0,0.3)",
            },
          },
          animationDuration: 900,
          animationEasing: "cubicOut" as const,
          animationDelay: (idx: number) => idx * 120,
          z: 2,
        },
      ],
    }
  }, [chartData, totalTasks])

  // ── Render ──

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <ListChecks className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Task Status Breakdown
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Current snapshot across all tasks
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 p-5">
        {isLoading ? (
          <div className="flex min-h-[380px] items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 text-muted-foreground"
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading status data…</span>
            </motion.div>
          </div>
        ) : totalTasks === 0 ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <ListChecks className="h-5 w-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm font-medium text-foreground">No tasks yet</p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              Tasks will appear here once documents are uploaded or synced.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* ── Bar Chart ── */}
            <ReactECharts
              option={echartsOption}
              style={{ height: 240, width: "100%" }}
              opts={{ renderer: "canvas" }}
              notMerge
            />

            {/* ── Status Summary Cards ── */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <AnimatePresence>
                {chartData.map((entry, i) => {
                  const pct =
                    totalTasks > 0
                      ? ((entry.value / totalTasks) * 100).toFixed(1)
                      : "0.0"

                  return (
                    <motion.div
                      key={entry.statusKey}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.7 + i * 0.08, ease: "easeOut" }}
                      className="flex flex-col rounded-lg border border-border/30 bg-muted/5 p-3 transition-all duration-200 hover:border-border/60 hover:bg-muted/15"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            background: entry.colors.base,
                            boxShadow: `0 0 6px ${entry.colors.glow}`,
                          }}
                        />
                        <span
                          className="text-[11px] font-semibold"
                          style={{ color: entry.colors.bright }}
                        >
                          {entry.name}
                        </span>
                      </div>
                      <span className="mt-2 text-xl font-bold tabular-nums tracking-tight text-foreground">
                        {entry.value}
                      </span>
                      <span className="mt-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                        {pct}%
                      </span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* ── Success Rate Metric ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.0, ease: "easeOut" }}
              className="relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-transparent px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-primary/90">
                    Success Rate
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Tasks completed successfully out of total
                  </p>
                </div>

                <span className="text-xl font-bold tabular-nums tracking-tight text-foreground">
                  {successRate}%
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}