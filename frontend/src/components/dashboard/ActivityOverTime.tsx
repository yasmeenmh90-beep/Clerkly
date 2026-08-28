"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { Activity } from "@/types"
import { getActivity } from "@/lib/api"


const DAYS_TO_SHOW = 14

const TYPE_LABELS: Record<string, string> = {
  task_created: "Created",
  payment_approved: "Approved",
  task_completed: "Completed",
  approval_requested: "Needs Action",
  document_uploaded: "Uploaded",
}

const TYPE_COLORS: Record<string, string> = {
  task_created: "#3b82f6",
  payment_approved: "#8b5cf6",
  task_completed: "#22c55e",
  approval_requested: "#f59e0b",
  document_uploaded: "#06b6d4",
}


function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}


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

  const { chartData, seenTypes } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dayBuckets: {
      key: string
      label: string
      counts: Record<string, number>
    }[] = []

    for (let i = DAYS_TO_SHOW - 1; i >= 0; i -= 1) {
      const day = new Date(today)
      day.setDate(day.getDate() - i)
      dayBuckets.push({
        key: day.toDateString(),
        label: formatDayLabel(day),
        counts: {},
      })
    }

    const bucketByKey = new Map(
      dayBuckets.map((bucket) => [bucket.key, bucket]),
    )

    const typesSeen = new Set<string>()

    for (const activity of activities) {
      const parsed = new Date(activity.raw_timestamp)
      if (Number.isNaN(parsed.getTime())) continue

      const dayKey = new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
      ).toDateString()

      const bucket = bucketByKey.get(dayKey)
      if (!bucket) continue

      bucket.counts[activity.type] =
        (bucket.counts[activity.type] ?? 0) + 1
      typesSeen.add(activity.type)
    }

    const data = dayBuckets.map((bucket) => ({
      day: bucket.label,
      ...bucket.counts,
    }))

    return { chartData: data, seenTypes: Array.from(typesSeen) }
  }, [activities])

  const hasAnyActivity = activities.length > 0

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/10 p-5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Activity Over Time
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Task events over the last {DAYS_TO_SHOW} days
        </p>
      </div>

      <div className="relative min-h-[260px] flex-1 p-5">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !hasAnyActivity ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <TrendingUp className="h-5 w-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No activity yet
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Legend
                iconType="circle"
                formatter={(value: string) =>
                  TYPE_LABELS[value] ?? value
                }
              />
              {seenTypes.map((type) => (
                <Bar
                  key={type}
                  dataKey={type}
                  stackId="activity"
                  name={type}
                  fill={TYPE_COLORS[type] ?? "#94a3b8"}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}