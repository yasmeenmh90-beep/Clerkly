"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  motion,
} from "framer-motion"

import {
  CheckCircle2,
  CheckSquare,
  Clock,
  FileWarning,
  Loader2,
} from "lucide-react"

import {
  getTasks,
} from "@/lib/api"


interface DashboardStats {
  totalTasks: number
  pendingApprovals: number
  activeTasks: number
  completedTasks: number
}


const EMPTY_STATS: DashboardStats = {
  totalTasks: 0,
  pendingApprovals: 0,
  activeTasks: 0,
  completedTasks: 0,
}


export function OverviewCards() {
  const [stats, setStats] =
    useState<DashboardStats>(EMPTY_STATS)

  const [isLoading, setIsLoading] =
    useState(true)


  useEffect(() => {
    async function fetchStats(): Promise<void> {
      try {
        setIsLoading(true)

        const tasks = await getTasks({
          page: 1,
          page_size: 100,
        })

        setStats({
          totalTasks: tasks.length,

          pendingApprovals: tasks.filter(
            (task) =>
              task.status ===
              "awaiting_approval",
          ).length,

          activeTasks: tasks.filter(
            (task) =>
              task.status === "pending" ||
              task.status === "approved" ||
              task.status === "in_progress",
          ).length,

          completedTasks: tasks.filter(
            (task) =>
              task.status === "completed",
          ).length,
        })
      } catch (error) {
        console.error(
          "Failed to load dashboard statistics",
          error,
        )

        setStats(EMPTY_STATS)
      } finally {
        setIsLoading(false)
      }
    }


    function handleTaskUpdate(): void {
      void fetchStats()
    }


    void fetchStats()

    window.addEventListener(
      "task-updated",
      handleTaskUpdate,
    )

    return () => {
      window.removeEventListener(
        "task-updated",
        handleTaskUpdate,
      )
    }
  }, [])


  const cards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: CheckSquare,
      color: "text-primary",
      background: "bg-primary/10",
      description: "All your tasks",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: FileWarning,
      color: "text-warning",
      background: "bg-warning/10",
      description: "Requires your review",
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks,
      icon: Clock,
      color: "text-primary",
      background: "bg-primary/10",
      description: "Pending or in progress",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "text-success",
      background: "bg-success/10",
      description: "Successfully completed",
    },
  ]


  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
          }}
          className="group relative h-32 overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </h3>

                <div
                  className={`rounded-lg p-2 transition-transform group-hover:scale-110 ${card.background}`}
                >
                  <card.icon
                    className={`h-4 w-4 ${card.color}`}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-3xl font-semibold tracking-tight text-foreground">
                  {card.value}
                </span>

                <span className="mt-2 text-xs text-muted-foreground">
                  {card.description}
                </span>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  )
}