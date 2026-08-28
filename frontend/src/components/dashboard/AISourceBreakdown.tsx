"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  AlertTriangle,
  Cpu,
  Loader2,
  Shield,
} from "lucide-react"

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
} from "recharts"

import type { Task } from "@/types"
import { getTasks } from "@/lib/api"


// ── Source metadata ────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  strands: "Amazon Bedrock",
  openai_fallback: "OpenAI",
  deterministic_fallback: "Rule-based fallback",
}

const SOURCE_COLORS: Record<string, string> = {
  strands: "#22c55e",
  openai_fallback: "#3b82f6",
  deterministic_fallback: "#f59e0b",
}

const SOURCE_GRADIENTS: Record<string, [string, string]> = {
  strands: ["#4ade80", "#16a34a"], // Premium emerald gradient
  openai_fallback: ["#60a5fa", "#2563eb"], // Premium blue gradient
  deterministic_fallback: ["#fbbf24", "#d97706"], // Premium amber gradient
}

const SOURCE_ORDER = [
  "strands",
  "openai_fallback",
  "deterministic_fallback",
]


// ── Chart data entry type ──────────────────────────

interface ChartEntry {
  name: string
  value: number
  color: string
  gradient: [string, string]
  sourceKey: string
}

// ── Active-segment renderer (recharts) ─────────────

function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <g style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.15))" }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius as number) + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
        style={{
          filter: "url(#donut-bevel-active)",
          transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      />
    </g>
  )
}

// ── Main component ─────────────────────────────────

export function AISourceBreakdown() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

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

    function handleTaskUpdate(): void {
      void fetchTasks()
    }

    void fetchTasks()

    window.addEventListener("task-updated", handleTaskUpdate)
    return () => {
      window.removeEventListener("task-updated", handleTaskUpdate)
    }
  }, [])

  const chartData = useMemo<ChartEntry[]>(() => {
    const counts: Record<string, number> = {}

    for (const task of tasks) {
      const source = (task as unknown as Record<string, unknown>).analysis_source
      if (typeof source !== "string" || source === "") continue
      counts[source] = (counts[source] ?? 0) + 1
    }

    const ordered = SOURCE_ORDER.filter((key) => counts[key] !== undefined)
    const rest = Object.keys(counts).filter(
      (key) => !SOURCE_ORDER.includes(key),
    )

    return [...ordered, ...rest].map((source) => ({
      name: SOURCE_LABELS[source] ?? source,
      value: counts[source],
      color: SOURCE_COLORS[source] ?? "#94a3b8",
      gradient: SOURCE_GRADIENTS[source] ?? ["#94a3b8", "#64748b"],
      sourceKey: source,
    }))
  }, [tasks])

  const totalAnalyzed = useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.value, 0),
    [chartData],
  )

  const fallbackEntry = useMemo(
    () => chartData.find((e) => e.sourceKey === "deterministic_fallback"),
    [chartData],
  )

  const fallbackRate = useMemo(() => {
    if (totalAnalyzed === 0 || !fallbackEntry) return 0
    return Math.round((fallbackEntry.value / totalAnalyzed) * 100)
  }, [totalAnalyzed, fallbackEntry])

  const onPieEnter = useCallback(
    (_: unknown, index: number) => setActiveIndex(index),
    [],
  )

  const onPieLeave = useCallback(
    () => setActiveIndex(-1),
    [],
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/10 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Cpu className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            AI Source Breakdown
          </h2>
          <p className="text-xs text-muted-foreground">
            Which layer actually analyzed each document
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1 p-5">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
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
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <AlertTriangle className="h-5 w-5 text-danger" />
            </div>
            <p className="text-sm font-medium text-foreground">{error}</p>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              Check your connection and try refreshing the page.
            </p>
          </div>
        ) : totalAnalyzed === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[320px] flex-col items-center justify-center p-4 text-center"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <Cpu className="h-5 w-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              0 Total Processed
            </p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              Upload a document or sync email to see the AI resilience breakdown.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* ── 3D Donut Chart ── */}
            <div className="relative mx-auto w-full max-w-[280px]">
              {/* Dynamic ambient glow */}
              <div
                className="pointer-events-none absolute inset-0 m-auto h-[200px] w-[200px] rounded-full opacity-40 blur-3xl transition-colors duration-500"
                style={{
                  background: activeIndex >= 0 ? chartData[activeIndex].color : "var(--primary)",
                  opacity: activeIndex >= 0 ? 0.25 : 0.1,
                }}
              />

              {/* Chart container with perspective & subtle floating animation */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-[240px]"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    transform: "rotateX(35deg) scale(1.05)",
                    transformOrigin: "center center",
                    filter: "drop-shadow(0px 20px 15px rgba(0,0,0,0.45)) drop-shadow(0px 4px 6px rgba(0,0,0,0.2))"
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {/* 3D Bevel Filter for default state */}
                        <filter id="donut-bevel" x="-20%" y="-20%" width="140%" height="140%">
                          <feComponentTransfer in="SourceAlpha" result="alpha" />
                          <feOffset dx="-2" dy="-2" in="alpha" result="offsetTop" />
                          <feGaussianBlur stdDeviation="2" in="offsetTop" result="blurTop" />
                          <feComposite operator="out" in2="blurTop" in="SourceAlpha" result="highlightMask" />
                          <feFlood floodColor="#ffffff" floodOpacity="0.4" result="highlightColor" />
                          <feComposite operator="in" in2="highlightMask" in="highlightColor" result="highlight" />

                          <feOffset dx="2" dy="8" in="alpha" result="offsetBottom" />
                          <feGaussianBlur stdDeviation="4" in="offsetBottom" result="blurBottom" />
                          <feComposite operator="out" in2="blurBottom" in="SourceAlpha" result="shadowMask" />
                          <feFlood floodColor="#000000" floodOpacity="0.6" result="shadowColor" />
                          <feComposite operator="in" in2="shadowMask" in="shadowColor" result="innerShadow" />

                          <feMerge>
                            <feMergeNode in="SourceGraphic" />
                            <feMergeNode in="highlight" />
                            <feMergeNode in="innerShadow" />
                          </feMerge>
                        </filter>

                        {/* 3D Bevel Filter for hover state (brighter, less deep) */}
                        <filter id="donut-bevel-active" x="-20%" y="-20%" width="140%" height="140%">
                          <feComponentTransfer in="SourceAlpha" result="alpha" />
                          <feOffset dx="-1" dy="-1" in="alpha" result="offsetTop" />
                          <feGaussianBlur stdDeviation="1.5" in="offsetTop" result="blurTop" />
                          <feComposite operator="out" in2="blurTop" in="SourceAlpha" result="highlightMask" />
                          <feFlood floodColor="#ffffff" floodOpacity="0.65" result="highlightColor" />
                          <feComposite operator="in" in2="highlightMask" in="highlightColor" result="highlight" />

                          <feOffset dx="2" dy="5" in="alpha" result="offsetBottom" />
                          <feGaussianBlur stdDeviation="3" in="offsetBottom" result="blurBottom" />
                          <feComposite operator="out" in2="blurBottom" in="SourceAlpha" result="shadowMask" />
                          <feFlood floodColor="#000000" floodOpacity="0.4" result="shadowColor" />
                          <feComposite operator="in" in2="shadowMask" in="shadowColor" result="innerShadow" />

                          <feMerge>
                            <feMergeNode in="SourceGraphic" />
                            <feMergeNode in="highlight" />
                            <feMergeNode in="innerShadow" />
                          </feMerge>
                        </filter>

                        {chartData.map((entry) => (
                          <linearGradient
                            key={entry.sourceKey}
                            id={`gradient-${entry.sourceKey}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor={entry.gradient[0]} stopOpacity={1} />
                            <stop offset="100%" stopColor={entry.gradient[1]} stopOpacity={1} />
                          </linearGradient>
                        ))}
                      </defs>

                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={68}
                        outerRadius={95}
                        paddingAngle={3}
                        cornerRadius={6}
                        {...({ activeIndex: activeIndex >= 0 ? activeIndex : undefined } as any)}
                        activeShape={renderActiveShape}
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                        animationBegin={100}
                        animationDuration={900}
                        animationEasing="ease-out"
                        stroke="none"
                      >
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.sourceKey}
                            fill={`url(#gradient-${entry.sourceKey})`}
                            style={{
                              filter: "url(#donut-bevel)",
                              transition: "all 0.3s ease",
                            }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* ── Tooltip Overlay (Unrotated) ── */}
              <AnimatePresence>
                {activeIndex >= 0 && chartData[activeIndex] && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="pointer-events-none absolute left-1/2 z-20 flex -translate-x-1/2 flex-col items-center justify-center rounded-xl border border-border/40 bg-card/95 px-3.5 py-2 shadow-2xl backdrop-blur-md"
                    style={{ top: "12%" }}
                  >
                    <div style={{ color: chartData[activeIndex].color }} className="text-xs font-bold tracking-wide">
                      {chartData[activeIndex].name}
                    </div>
                    <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                      {chartData[activeIndex].value} task{chartData[activeIndex].value === 1 ? "" : "s"} &middot;{" "}
                      {totalAnalyzed > 0
                        ? Math.round((chartData[activeIndex].value / totalAnalyzed) * 100)
                        : 0}
                      %
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Center label (Unrotated) ── */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1">
                <motion.span
                  key={totalAnalyzed}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-4xl font-extrabold tracking-tight text-foreground drop-shadow-md"
                >
                  {totalAnalyzed.toLocaleString()}
                </motion.span>
                <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground drop-shadow-sm">
                  Total Processed
                </span>
              </div>
            </div>

            {/* ── Legend ── */}
            <div className="space-y-2">
              <AnimatePresence>
                {chartData.map((entry, i) => {
                  const pct =
                    totalAnalyzed > 0
                      ? Math.round((entry.value / totalAnalyzed) * 100)
                      : 0

                  return (
                    <motion.div
                      key={entry.sourceKey}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.5 + i * 0.1,
                        ease: "easeOut"
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseLeave={() => setActiveIndex(-1)}
                      className={`flex cursor-default items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-all duration-300 ${
                        activeIndex === i
                          ? "border-primary/30 bg-primary/10 shadow-sm"
                          : "border-border/30 bg-muted/10 hover:border-border/60 hover:bg-muted/30"
                      }`}
                    >
                      {/* Glowing dot */}
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${entry.gradient[0]}, ${entry.gradient[1]})`,
                          boxShadow: `0 0 10px 1px ${entry.color}80`,
                        }}
                      />

                      {/* Source name */}
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {entry.name}
                      </span>

                      {/* Count */}
                      <span className="text-sm font-medium tabular-nums text-muted-foreground">
                        {entry.value.toLocaleString()}
                      </span>

                      {/* Percentage */}
                      <span className="min-w-[36px] text-right text-sm font-bold tabular-nums text-foreground">
                        {pct}%
                      </span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* ── Fallback rate metric ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
              className="relative overflow-hidden rounded-xl border border-warning/20 bg-gradient-to-r from-warning/10 to-transparent px-4 py-3 shadow-sm"
            >
              <div className="pointer-events-none absolute -left-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-warning/20 blur-2xl" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 shadow-inner">
                  <Shield className="h-4.5 w-4.5 text-warning" />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-warning/90">
                    Fallback Rate
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {fallbackEntry
                      ? `${fallbackEntry.value.toLocaleString()} task${fallbackEntry.value === 1 ? "" : "s"} used fallback`
                      : "No fallback tasks"}
                  </p>
                </div>

                <span className="text-xl font-bold tabular-nums tracking-tight text-foreground drop-shadow-sm">
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
