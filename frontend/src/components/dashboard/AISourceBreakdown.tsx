"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Cpu, Loader2, Shield } from "lucide-react"
import ReactECharts from "echarts-for-react"
import * as echarts from "echarts/core"

import type { Task } from "@/types"
import { getTasks } from "@/lib/api"

// ── Source metadata ────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  strands: "AWS Bedrock",
  openai_fallback: "OpenAI",
  deterministic_fallback: "Rule-Based Fallback",
}

const SOURCE_COLORS: Record<string, { base: string; bright: string; deep: string; glow: string }> = {
  strands: {
    base: "#a855f7",
    bright: "#c084fc",
    deep: "#7c3aed",
    glow: "rgba(168, 85, 247, 0.35)",
  },
  openai_fallback: {
    base: "#3b82f6",
    bright: "#60a5fa",
    deep: "#2563eb",
    glow: "rgba(59, 130, 246, 0.35)",
  },
  deterministic_fallback: {
    base: "#10b981",
    bright: "#34d399",
    deep: "#059669",
    glow: "rgba(16, 185, 129, 0.35)",
  },
}

const SOURCE_ORDER = ["strands", "openai_fallback", "deterministic_fallback"]

// ── Types ──────────────────────────────────────────────────────────

interface SourceEntry {
  name: string
  value: number
  sourceKey: string
  colors: { base: string; bright: string; deep: string; glow: string }
}

interface EChartsTooltipParams {
  name: string
  value: number
  percent: number
  color: string
  marker: string
}

// ── Component ──────────────────────────────────────────────────────

export function AISourceBreakdown() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const chartRef = useRef<ReactECharts | null>(null)

  // ── Data fetching ──

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getTasks({ page: 1, page_size: 100 })
      setTasks(data)
    } catch (err) {
      console.error("Failed to load AI source breakdown", err)
      setError("Unable to load AI processing data.")
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

  const chartData = useMemo<SourceEntry[]>(() => {
    const counts: Record<string, number> = {}

    for (const task of tasks) {
      const source = (task as unknown as Record<string, unknown>).analysis_source
      if (typeof source !== "string" || source === "") continue
      counts[source] = (counts[source] ?? 0) + 1
    }

    const ordered = SOURCE_ORDER.filter((k) => counts[k] !== undefined)
    const rest = Object.keys(counts).filter((k) => !SOURCE_ORDER.includes(k))

    const defaultColors = { base: "#94a3b8", bright: "#cbd5e1", deep: "#64748b", glow: "rgba(148,163,184,0.3)" }

    return [...ordered, ...rest].map((source) => ({
      name: SOURCE_LABELS[source] ?? source,
      value: counts[source],
      sourceKey: source,
      colors: SOURCE_COLORS[source] ?? defaultColors,
    }))
  }, [tasks])

  const totalAnalyzed = useMemo(
    () => chartData.reduce((sum, e) => sum + e.value, 0),
    [chartData],
  )

  const fallbackEntry = useMemo(
    () => chartData.find((e) => e.sourceKey === "deterministic_fallback"),
    [chartData],
  )

  const fallbackRate = useMemo(() => {
    if (totalAnalyzed === 0 || !fallbackEntry) return "0.0"
    return ((fallbackEntry.value / totalAnalyzed) * 100).toFixed(1)
  }, [totalAnalyzed, fallbackEntry])

  // ── ECharts option ──

  const echartsOption = useMemo(() => {
    if (chartData.length === 0) return {}

    // Build gradient for each segment
    const pieData = chartData.map((entry) => ({
      name: entry.name,
      value: entry.value,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: entry.colors.bright },
          { offset: 1, color: entry.colors.deep },
        ]),
        borderColor: "rgba(0,0,0,0.3)",
        borderWidth: 1,
        shadowBlur: 12,
        shadowColor: entry.colors.glow,
      },
    }))

    // Shadow ring data (darker, offset below for depth)
    const shadowData = chartData.map((entry) => ({
      name: entry.name,
      value: entry.value,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: entry.colors.deep },
          { offset: 1, color: "rgba(0,0,0,0.6)" },
        ]),
        borderColor: "rgba(0,0,0,0.5)",
        borderWidth: 0,
      },
    }))

    return {
      tooltip: {
        trigger: "item" as const,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          color: "#f1f5f9",
          fontSize: 13,
          fontFamily: "inherit",
        },
        formatter: (params: EChartsTooltipParams) => {
          return `<div style="font-weight:600;margin-bottom:6px;font-size:14px;color:${params.color}">${params.name}</div>
                  <div style="color:#cbd5e1;font-size:13px">${params.value} task${params.value === 1 ? "" : "s"} · <b style="color:#f1f5f9">${params.percent.toFixed(1)}%</b></div>`
        },
        extraCssText: "border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.4);backdrop-filter:blur(8px);",
      },
      series: [
        // Shadow / depth ring (behind, slightly offset down)
        {
          type: "pie" as const,
          radius: ["46%", "72%"],
          center: ["50%", "53%"], // shifted down 3% for depth offset
          silent: true,
          animation: false,
          label: { show: false },
          labelLine: { show: false },
          data: shadowData,
          z: 1,
        },
        // Main donut ring
        {
          type: "pie" as const,
          radius: ["46%", "72%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          padAngle: 2,
          itemStyle: {
            borderRadius: 6,
          },
          label: {
            show: false,
          },
          labelLine: { show: false },
          emphasis: {
            scale: true,
            scaleSize: 8,
            itemStyle: {
              shadowBlur: 24,
              shadowColor: "rgba(0,0,0,0.4)",
            },
          },
          animationType: "scale" as const,
          animationEasing: "cubicOut" as const,
          animationDuration: 1000,
          animationDelay: 200,
          data: pieData,
          z: 2,
        },
        // Inner subtle highlight ring (to create glass-like inner edge)
        {
          type: "pie" as const,
          radius: ["44%", "46%"],
          center: ["50%", "50%"],
          silent: true,
          animation: false,
          label: { show: false },
          labelLine: { show: false },
          data: [
            {
              value: 1,
              itemStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                  { offset: 0, color: "rgba(255,255,255,0.06)" },
                  { offset: 1, color: "rgba(255,255,255,0.01)" },
                ]),
                borderWidth: 0,
              },
            },
          ],
          z: 3,
        },
      ],
      // Center text via graphic
      graphic: [
        {
          type: "text" as const,
          left: "center",
          top: "43%",
          style: {
            text: "TOTAL",
            fill: "#94a3b8",
            fontSize: 11,
            fontWeight: 700 as const,
            letterSpacing: 3,
            fontFamily: "inherit",
          },
          z: 10,
        },
        {
          type: "text" as const,
          left: "center",
          top: "50%",
          style: {
            text: String(totalAnalyzed),
            fill: "#f1f5f9",
            fontSize: 36,
            fontWeight: 800 as const,
            fontFamily: "inherit",
          },
          z: 10,
        },
      ],
    }
  }, [chartData, totalAnalyzed])

  // ── Render ──

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Cpu className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            AI Source Breakdown
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Which AI layer analyzed each document
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 p-5">
        {isLoading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 text-muted-foreground"
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading analysis data…</span>
            </motion.div>
          </div>
        ) : error ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground">{error}</p>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              Check your connection and try refreshing the page.
            </p>
          </div>
        ) : totalAnalyzed === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <Cpu className="h-5 w-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm font-medium text-foreground">No AI source data available</p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              Upload a document or sync email to see the AI source breakdown.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* ── Donut Chart ── */}
            <div className="relative mx-auto w-full max-w-[320px]">
              {/* Subtle ambient glow */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[50px]" />

              <ReactECharts
                ref={chartRef}
                option={echartsOption}
                style={{ height: 280, width: "100%" }}
                opts={{ renderer: "canvas" }}
                notMerge
              />
            </div>

            {/* ── Source Legend Cards ── */}
            <div className="space-y-2">
              <AnimatePresence>
                {chartData.map((entry, i) => {
                  const pct =
                    totalAnalyzed > 0
                      ? ((entry.value / totalAnalyzed) * 100).toFixed(1)
                      : "0.0"

                  return (
                    <motion.div
                      key={entry.sourceKey}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.8 + i * 0.08, ease: "easeOut" }}
                      className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/5 px-3.5 py-2.5 transition-all duration-200 hover:border-border/60 hover:bg-muted/15"
                    >
                      {/* Color indicator */}
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${entry.colors.bright}, ${entry.colors.deep})`,
                          boxShadow: `0 0 8px ${entry.colors.glow}`,
                        }}
                      />

                      {/* Source name */}
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {entry.name}
                      </span>

                      {/* Count */}
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {entry.value}
                      </span>

                      {/* Percentage */}
                      <span className="min-w-[44px] text-right text-sm font-semibold tabular-nums text-foreground">
                        {pct}%
                      </span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* ── Fallback Rate Metric ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.1, ease: "easeOut" }}
              className="relative overflow-hidden rounded-xl border border-emerald-500/15 bg-gradient-to-r from-emerald-500/5 to-transparent px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                  <Shield className="h-4 w-4 text-emerald-400" />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-emerald-400/90">
                    Fallback Rate
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {fallbackEntry
                      ? `${fallbackEntry.value} task${fallbackEntry.value === 1 ? "" : "s"} used fallback`
                      : "No fallback tasks"}
                  </p>
                </div>

                <span className="text-xl font-bold tabular-nums tracking-tight text-foreground">
                  {fallbackRate}%
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
