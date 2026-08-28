"use client"

import { ActivityOverTime } from "@/components/dashboard/ActivityOverTime"
import { RecentActivity } from "@/components/dashboard/RecentActivity"


interface ActivityOverviewProps {
  searchQuery?: string
}


/**
 * Combines the chart (volume over time, at-a-glance) with the
 * existing timeline (per-event detail) in one panel — the chart
 * answers "is the system active," the timeline answers "what
 * exactly happened."
 */
export function ActivityOverview({
  searchQuery,
}: ActivityOverviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ActivityOverTime />
      <RecentActivity searchQuery={searchQuery} />
    </div>
  )
}