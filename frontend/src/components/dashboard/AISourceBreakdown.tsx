"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Cpu, Shield } from "lucide-react"

import ReactECharts from "echarts-for-react"
import * as echarts from "echarts/core"

import type { Task } from "@/types"
import { getTasks } from "@/lib/api"

const SOURCE_LABELS: Record<string, string> = {
  strands: "AWS Bedrock",
  openai_fallback: "OpenAI",
  deterministic_fallback: "Rule-Based Fallback",
}

const SOURCE_COLORS: Record<string, string> = {
  strands: "#a855f7",
  openai_fallback: "#3b82f6",
  deterministic_fallback: "#22c55e",
}

const SOURCE_GRADIENTS: Record<string, [string, string]> = {
  strands: ["#c084fc", "#a855f7"],
  openai_fallback: ["#60a5fa", "#3b82f6"],
  deterministic_fallback: ["#4ade80", "#22c55e"],
}

const SOURCE_GRADIENTS_DARK: Record<string, [string, string]> = {
  strands: ["#7e22ce", "#581c87"],
  openai_fallback: ["#1d4ed8", "#1e3a8a"],
  deterministic_fallback: ["#15803d", "#14532d"],
}

const SOURCE_ORDER = ["strands", "openai_fallback", "deterministic_fallback"]

interface ChartEntry {
  name: string
  value: number
  color: string
  gradient: [string, string]
  darkGradient: [string, string]
  sourceKey: string
}

export function AISourceBreakdown() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // To sync react state with echarts hover
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1)
  const [hoveredData, setHoveredData] = useState<ChartEntry | null>(null)

  useEffect(() => {
    async function fetchTasks(): Promise<void> {
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
    }

    void fetchTasks()
    window.addEventListener("task-updated", fetchTasks)
    return () => window.removeEventListener("task-updated", fetchTasks)
  }, [])

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const task of tasks) {
      const source = (task as unknown as Record<string, unknown>).analysis_source
      if (typeof source !== "string" || source === "") continue
      counts[source] = (counts[source] ?? 0) + 1
    }

    const ordered = SOURCE_ORDER.filter((key) => counts[key] !== undefined)
    const rest = Object.keys(counts).filter((key) => !SOURCE_ORDER.includes(key))

    return [...ordered, ...rest].map((source) => ({
      name: SOURCE_LABELS[source] ?? source,
      value: counts[source],
      color: SOURCE_COLORS[source] ?? "#94a3b8",
      gradient: SOURCE_GRADIENTS[source] ?? ["#94a3b8", "#64748b"],
      darkGradient: SOURCE_GRADIENTS_DARK[source] ?? ["#475569", "#334155"],
      sourceKey: source,
    }))
  }, [tasks])

  const totalAnalyzed = useMemo(() => chartData.reduce((sum, entry) => sum + entry.value, 0), [chartData])

  const fallbackEntry = useMemo(() => chartData.find((e) => e.sourceKey === "deterministic_fallback"), [chartData])
  const fallbackRate = useMemo(() => {
    if (totalAnalyzed === 0 || !fallbackEntry) return "0.0"
    return ((fallbackEntry.value / totalAnalyzed) * 100).toFixed(1)
  }, [totalAnalyzed, fallbackEntry])

  // Generate ECharts option for a stacked 3D pie
  const option = useMemo(() => {
    const layers = 15;
    const series = [];

    // Helper to generate ECharts LinearGradient objects
    const getGradient = (colors: [string, string]) => {
      return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: colors[0] },
        { offset: 1, color: colors[1] }
      ])
    }

    for (let i = 0; i < layers; i++) {
      const isTop = i === layers - 1;
      
      series.push({
        type: 'pie',
        radius: ['55%', '85%'],
        // shift downward to create depth
        center: ['50%', `calc(45% + ${(layers - i) * 1.5}px)`],
        silent: !isTop, // only hover top layer
        animation: isTop, // only animate top layer to save performance
        data: chartData.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: {
            color: isTop ? getGradient(d.gradient) : getGradient(d.darkGradient),
            borderWidth: isTop ? 1 : 0,
            borderColor: isTop ? 'rgba(255,255,255,0.2)' : 'transparent',
          }
        })),
        itemStyle: {
          borderRadius: 2,
        },
        label: {
          show: isTop,
          position: 'inside',
          formatter: (params: { percent: number }) => {
            if (params.percent < 5) return '';
            return `{val|${params.percent.toFixed(1)}%}`;
          },
          rich: {
            val: {
              color: '#fff',
              fontSize: 12,
              fontWeight: 'bold',
              textShadowColor: 'rgba(0,0,0,0.5)',
              textShadowBlur: 4,
              textShadowOffsetY: 2
            }
          }
        },
        labelLine: { show: false },
        emphasis: {
          scaleSize: 10,
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0,0,0,0.5)'
          }
        }
      });
    }

    return {
      tooltip: { show: false }, // we use custom react tooltip
      series
    }
  }, [chartData])

  // Listen to echarts events
  const onEvents = {
    mouseover: (params: { dataIndex: number }) => {
      setHoveredIndex(params.dataIndex)
      setHoveredData(chartData[params.dataIndex])
    },
    mouseout: () => {
      setHoveredIndex(-1)
      setHoveredData(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 border-b border-border/40 bg-card p-5">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            AI Source Breakdown
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Distribution of tasks processed by AI sources
          </p>
        </div>
      </div>

      <div className="relative flex-1 p-5">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Cpu className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
        ) : totalAnalyzed === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <Cpu className="mb-3 h-8 w-8 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium text-foreground">0 Tasks Processed</p>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            
            {/* ── 3D Donut Area ── */}
            <div className="relative flex min-h-[260px] w-full items-center justify-center">
              
              {/* Dynamic ambient glow */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[40px] transition-colors duration-500"
                style={{
                  background: hoveredIndex >= 0 ? chartData[hoveredIndex].color : "var(--primary)",
                  opacity: hoveredIndex >= 0 ? 0.35 : 0.15,
                }}
              />

              {/* Chart container with perspective */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative h-[280px] w-full max-w-[340px]"
              >
                {/* ScaleY creates the 3D isometric perspective */}
                <div 
                  className="absolute inset-0"
                  style={{ 
                    transform: "scaleY(0.65) scaleX(1.1)", 
                    transformOrigin: "center center",
                    filter: "drop-shadow(0px 30px 20px rgba(0,0,0,0.6))"
                  }}
                >
                  <ReactECharts
                    option={option}
                    onEvents={onEvents}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>

                {/* ── Center Content ── */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Total
                  </span>
                  <span className="mt-1 text-4xl font-extrabold tracking-tighter text-foreground drop-shadow-md">
                    {totalAnalyzed}
                  </span>
                </div>
              </motion.div>

              {/* ── Hover "Current Selection" Card ── */}
              <AnimatePresence>
                {hoveredData && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="pointer-events-none absolute right-0 top-1/2 z-20 flex w-36 -translate-y-1/2 flex-col items-center rounded-xl border border-border/50 bg-card/95 p-3 shadow-2xl backdrop-blur-md"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Current Selection
                    </span>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: hoveredData.color, boxShadow: `0 0 8px ${hoveredData.color}` }}
                      />
                      <span className="text-xs font-bold text-foreground">
                        {hoveredData.name}
                      </span>
                    </div>
                    <span className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                      {hoveredData.value}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Tasks</span>
                    
                    <div className="mt-3 w-full rounded-md bg-muted/30 py-1.5 text-center border border-border/40">
                      <span className="text-xs font-bold text-foreground">
                        {((hoveredData.value / totalAnalyzed) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Legends ── */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <AnimatePresence>
                {chartData.map((entry, i) => {
                  const pct = totalAnalyzed > 0 ? ((entry.value / totalAnalyzed) * 100).toFixed(1) : "0.0"
                  return (
                    <motion.div
                      key={entry.sourceKey}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                      className={`flex flex-col rounded-xl border p-3 transition-all duration-300 ${
                        hoveredIndex === i
                          ? "border-primary/40 bg-primary/5 shadow-md"
                          : "border-border/40 bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${entry.gradient[0]}, ${entry.gradient[1]})`,
                            boxShadow: `0 0 10px 1px ${entry.color}80`,
                          }}
                        />
                        <span className="text-[11px] font-semibold text-foreground">
                          {entry.name}
                        </span>
                      </div>
                      
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-xl font-bold text-foreground">{entry.value}</span>
                        <div className="rounded-md bg-muted/40 px-2 py-1 text-[10px] font-bold text-muted-foreground">
                          {pct}%
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* ── Fallback rate ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="relative mt-4 flex items-center justify-between overflow-hidden rounded-xl border border-border/40 bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 border border-success/20">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Fallback Rate</p>
                  <span className="text-2xl font-extrabold text-foreground">{fallbackRate}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
