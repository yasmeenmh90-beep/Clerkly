"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Flame, Loader2, TrendingDown, TrendingUp, Zap } from "lucide-react"
import ReactECharts from "echarts-for-react"
import * as echarts from "echarts/core"

import type { Activity } from "@/types"
import { getActivity } from "@/lib/api"

// ── Constants ──────────────────────────────────────────────────────

const DAYS_TO_SHOW = 14

const LINE_COLORS = {
  base: "#8b5cf6",
  bright: "#a78bfa",
  deep: "#7c3aed",
  glow: "rgba(139, 92, 246, 0.45)",
}

// ── Types ──────────────────────────────────────────────────────────

interface DayBucket {
  key: string
  label: string
  total: number
}

interface EChartsLineTooltipParams {
  name: string
  value: number
  color: string
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

// ── Component ──────────────────────────────────────────────────────

export function ActivityOverTime() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity(): Promise<void> {
      try {
        setIsLoading(true)
        const data = await getActivity()
        setActivities(data)
      } catch (error) {
        console.error("Failed to load activity over time", error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchActivity()
  }, [])

  // ── Computed data ──

  const { chartData, totalInPeriod, percentChange } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dayBuckets: DayBucket[] = []

    for (let i = DAYS_TO_SHOW - 1; i >= 0; i -= 1) {
      const day = new Date(today)
      day.setDate(day.getDate() - i)
      dayBuckets.push({
        key: day.toDateString(),
        label: formatDayLabel(day),
        total: 0,
      })
    }

    const bucketByKey = new Map(dayBuckets.map((bucket) => [bucket.key, bucket]))

    const periodStart = new Date(today)
    periodStart.setDate(periodStart.getDate() - (DAYS_TO_SHOW - 1))
    const previousPeriodStart = new Date(periodStart)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - DAYS_TO_SHOW)

    let currentTotal = 0
    let previousTotal = 0

    for (const activity of activities) {
      const parsed = new Date(activity.raw_timestamp)
      if (Number.isNaN(parsed.getTime())) continue

      const eventDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
      const dayKey = eventDay.toDateString()

      const bucket = bucketByKey.get(dayKey)
      if (bucket) {
        bucket.total += 1
        currentTotal += 1
      } else if (eventDay >= previousPeriodStart && eventDay < periodStart) {
        previousTotal += 1
      }
    }

    const change =
      previousTotal === 0
        ? currentTotal > 0
          ? 100
          : 0
        : Math.round(((currentTotal - previousTotal) / previousTotal) * 100)

    return {
      chartData: dayBuckets,
      totalInPeriod: currentTotal,
      percentChange: change,
    }
  }, [activities])

  const hasAnyActivity = activities.length > 0
  const peakValue = useMemo(
    () => Math.max(1, ...chartData.map((d) => d.total)),
    [chartData],
  )

  const peakDay = useMemo(() => {
    if (chartData.length === 0) return null
    return chartData.reduce((best, d) => (d.total > best.total ? d : best), chartData[0])
  }, [chartData])

  const dailyAverage = useMemo(() => {
    if (chartData.length === 0) return "0.0"
    const sum = chartData.reduce((acc, d) => acc + d.total, 0)
    return (sum / chartData.length).toFixed(1)
  }, [chartData])

  const peakDayIndex = useMemo(() => {
    if (!peakDay || peakDay.total === 0) return -1
    return chartData.findIndex((d) => d.key === peakDay.key)
  }, [chartData, peakDay])

  // ── ECharts option ──

  const echartsOption = useMemo(() => {
    const categories = chartData.map((d) => d.label)
    const values = chartData.map((d) => d.total)
    const avgValue = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0

    return {
      tooltip: {
        trigger: "axis" as const,
        axisPointer: {
          type: "line" as const,
          lineStyle: {
            color: LINE_COLORS.base,
            width: 1,
            type: "dashed" as const,
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
        formatter: (params: EChartsLineTooltipParams[]) => {
          const p = params[0]
          if (!p) return ""
          return `<div style="font-weight:600;margin-bottom:6px;font-size:14px;color:${p.color}">${p.name}</div>
                  <div style="color:#cbd5e1;font-size:13px">${p.value} task${p.value === 1 ? "" : "s"} processed</div>`
        },
        extraCssText:
          "border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.4);backdrop-filter:blur(8px);",
      },
      grid: {
        left: 8,
        right: 16,
        top: 24,
        bottom: 28,
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: categories,
        boundaryGap: false,
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
          interval: Math.ceil(categories.length / 8) - 1,
        },
      },
      yAxis: {
        type: "value" as const,
        min: 0,
        max: peakValue,
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
        // Depth shadow line (offset below, blurred, for a raised feel)
        {
          type: "line" as const,
          data: values,
          smooth: 0.35,
          symbol: "none",
          silent: true,
          animation: false,
          lineStyle: { width: 0 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(0,0,0,0.18)" },
              { offset: 1, color: "rgba(0,0,0,0)" },
            ]),
          },
          z: 1,
        },
        // Main glowing line + gradient fill
        {
          type: "line" as const,
          data: values,
          smooth: 0.35,
          symbol: "circle",
          symbolSize: 7,
          showSymbol: false,
          itemStyle: {
            color: LINE_COLORS.bright,
            borderColor: "rgba(15,23,42,0.9)",
            borderWidth: 2,
          },
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: LINE_COLORS.deep },
              { offset: 0.5, color: LINE_COLORS.bright },
              { offset: 1, color: LINE_COLORS.base },
            ]),
            shadowBlur: 16,
            shadowColor: LINE_COLORS.glow,
            shadowOffsetY: 6,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(139, 92, 246, 0.45)" },
              { offset: 0.6, color: "rgba(139, 92, 246, 0.12)" },
              { offset: 1, color: "rgba(139, 92, 246, 0.0)" },
            ]),
          },
          emphasis: {
            focus: "series" as const,
            itemStyle: {
              shadowBlur: 24,
              shadowColor: LINE_COLORS.glow,
            },
          },
          markLine: {
            silent: true,
            symbol: "none",
            label: {
              show: true,
              position: "insideEndTop" as const,
              formatter: "Avg",
              color: "#94a3b8",
              fontSize: 10,
              fontFamily: "inherit",
            },
            lineStyle: {
              color: "rgba(148, 163, 184, 0.35)",
              type: "dashed" as const,
              width: 1,
            },
            data: [{ yAxis: avgValue }],
          },
          animationDuration: 1000,
          animationEasing: "cubicOut" as const,
          z: 2,
        },
        // Pulsing ripple marker on the peak day
        ...(peakDayIndex >= 0
          ? [
              {
                type: "effectScatter" as const,
                coordinateSystem: "cartesian2d" as const,
                data: [[peakDayIndex, values[peakDayIndex]]],
                symbolSize: 9,
                rippleEffect: {
                  brushType: "stroke" as const,
                  scale: 3.2,
                  period: 3,
                },
                itemStyle: {
                  color: LINE_COLORS.bright,
                  shadowBlur: 12,
                  shadowColor: LINE_COLORS.glow,
                },
                z: 3,
              },
            ]
          : []),
      ],
    }
  }, [chartData, peakValue, peakDayIndex])

  // ── Render ──

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-lg transition-colors duration-300 hover:border-primary/25"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Activity Over Time
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Task events over the last {DAYS_TO_SHOW} days
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 p-5">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 text-muted-foreground"
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading activity data…</span>
            </motion.div>
          </div>
        ) : !hasAnyActivity ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <TrendingUp className="h-5 w-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm font-medium text-foreground">No activity yet</p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              Task events will appear here once activity starts flowing in.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* ── Line Chart ── */}
            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 top-1/3 h-[140px] w-[70%] -translate-x-1/2 rounded-full bg-primary/10 blur-[60px]" />
              <ReactECharts
                option={echartsOption}
                style={{ height: 240, width: "100%" }}
                opts={{ renderer: "canvas" }}
                notMerge
              />
            </div>

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-2 gap-2.5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.35, ease: "easeOut" }}
                className="flex items-center gap-2.5 rounded-lg border border-border/30 bg-muted/5 px-3.5 py-2.5 transition-all duration-200 hover:border-border/60 hover:bg-muted/15"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Peak Day
                  </p>
                  <p className="truncate text-sm font-bold tabular-nums text-foreground">
                    {peakDay && peakDay.total > 0
                      ? `${peakDay.label} · ${peakDay.total}`
                      : "—"}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.42, ease: "easeOut" }}
                className="flex items-center gap-2.5 rounded-lg border border-border/30 bg-muted/5 px-3.5 py-2.5 transition-all duration-200 hover:border-border/60 hover:bg-muted/15"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Daily Average
                  </p>
                  <p className="truncate text-sm font-bold tabular-nums text-foreground">
                    {dailyAverage} tasks
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ── Trend Metric ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55, ease: "easeOut" }}
              className="relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-transparent px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  {percentChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-primary" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-primary/90">
                    {totalInPeriod} task{totalInPeriod === 1 ? "" : "s"} processed
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Over the last {DAYS_TO_SHOW} days
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 text-xl font-bold tabular-nums tracking-tight ${
                    percentChange >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {percentChange >= 0 ? "+" : ""}
                  {percentChange}%
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}