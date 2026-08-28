"use client"

import {
  Suspense,
  useEffect,
  useState,
} from "react"

import {
  motion,
} from "framer-motion"

import {
  useSearchParams,
} from "next/navigation"

import {
  useAuth,
} from "@/components/auth/AuthProvider"

import {
  OverviewCards,
} from "@/components/dashboard/OverviewCards"

import {
  PriorityTasks,
} from "@/components/dashboard/PriorityTasks"

import {
  ProcessingDocuments,
} from "@/components/dashboard/ProcessingDocuments"

import {
ActivityOverview,
} from "@/components/dashboard/ActivityOverview"

import {
AISourceBreakdown,
} from "@/components/dashboard/AISourceBreakdown"

import {
TaskStatusBreakdown,
} from "@/components/dashboard/TaskStatusBreakdown"

import {
UpcomingDeadlines,
} from "@/components/dashboard/UpcomingDeadlines"

function getGreeting(): string {
  const currentHour = new Date().getHours()

  if (currentHour < 12) {
    return "Good morning"
  }

  if (currentHour < 18) {
    return "Good afternoon"
  }

  return "Good evening"
}


function DashboardContent() {
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [query, setQuery] = useState(
    searchParams.get("q") ?? "",
  )

  const displayName =
    user?.full_name?.trim() ||
    user?.email.split("@")[0] ||
    "User"

  const greeting = getGreeting()


  useEffect(() => {
    function handleSearch(): void {
      const parameters = new URLSearchParams(
        window.location.search,
      )

      setQuery(parameters.get("q") ?? "")
    }

    window.addEventListener(
      "search-updated",
      handleSearch,
    )

    return () => {
      window.removeEventListener(
        "search-updated",
        handleSearch,
      )
    }
  }, [])


  useEffect(() => {
    setQuery(searchParams.get("q") ?? "")
  }, [searchParams])


  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-8">
      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="mt-2 flex flex-col gap-1"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting}, {displayName}
        </h1>

        <p className="text-sm text-muted-foreground">
          Here&apos;s what needs your attention today.
        </p>
      </motion.div>


      <OverviewCards />


      <div className="grid grid-cols-1 gap-6 auto-rows-[minmax(400px,auto)] lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex-1">
            <PriorityTasks searchQuery={query} />
          </div>

          <div className="flex-1">
            <UpcomingDeadlines
              searchQuery={query}
            />
          </div>
        </div>


        <div className="flex flex-col gap-6">
<div className="flex-1">
<ProcessingDocuments
searchQuery={query}
/>
</div>
</div>
</div>


<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
<AISourceBreakdown />
<TaskStatusBreakdown />
</div>


<ActivityOverview searchQuery={query} />
</div>
  )
}


export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}