"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  useRouter,
} from "next/navigation"

import {
  motion,
} from "framer-motion"

import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Loader2,
  SearchX,
} from "lucide-react"

import type {
  Task,
} from "@/types"

import {
  getTasks,
} from "@/lib/api"

import {
  TaskStatusBadge,
} from "@/components/ui/badges"


interface UpcomingDeadlinesProps {
  searchQuery?: string
}


function parseDeadline(
  deadline: string,
): Date {
  return new Date(`${deadline}T00:00:00`)
}


function formatDeadline(
  deadline: string,
): string {
  const parsedDeadline =
    parseDeadline(deadline)

  if (Number.isNaN(parsedDeadline.getTime())) {
    return deadline
  }

  return parsedDeadline.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  )
}


function isUrgentDeadline(
  deadline: string,
): boolean {
  const deadlineTime =
    parseDeadline(deadline).getTime()

  if (Number.isNaN(deadlineTime)) {
    return false
  }

  const difference =
    deadlineTime - Date.now()

  return (
    difference <=
    3 * 24 * 60 * 60 * 1000
  )
}


export function UpcomingDeadlines({
  searchQuery = "",
}: UpcomingDeadlinesProps) {
  const router = useRouter()

  const [tasks, setTasks] =
    useState<Task[]>([])

  const [isLoading, setIsLoading] =
    useState(true)


  useEffect(() => {
    async function fetchTasks(): Promise<void> {
      try {
        setIsLoading(true)

        const data = await getTasks({
          page: 1,
          page_size: 100,
        })

        setTasks(data)
      } catch (error) {
        console.error(
          "Failed to load upcoming deadlines",
          error,
        )
      } finally {
        setIsLoading(false)
      }
    }


    function handleTaskUpdate(): void {
      void fetchTasks()
    }


    void fetchTasks()

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


  const upcomingTasks = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase()

    return tasks
      .filter((task) => {
        if (
          !task.deadline ||
          task.status === "completed" ||
          task.status === "rejected"
        ) {
          return false
        }

        return (
          normalizedSearch.length === 0 ||
          task.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          task.source
            .toLowerCase()
            .includes(normalizedSearch) ||
          (task.description ?? "")
            .toLowerCase()
            .includes(normalizedSearch)
        )
      })
      .sort((firstTask, secondTask) => {
        return (
          parseDeadline(
            firstTask.deadline as string,
          ).getTime() -
          parseDeadline(
            secondTask.deadline as string,
          ).getTime()
        )
      })
  }, [
    tasks,
    searchQuery,
  ])


  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/10 p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Upcoming Deadlines
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Tasks approaching their due date
          </p>
        </div>

        <Link
          href="/tasks"
          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View All

          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>


      <div className="relative min-h-[200px] max-h-[420px] flex-1 p-5 overflow-y-auto">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              {searchQuery ? (
                <SearchX className="h-5 w-5 text-muted-foreground opacity-50" />
              ) : (
                <Calendar className="h-5 w-5 text-muted-foreground opacity-50" />
              )}
            </div>

            <p className="text-sm font-medium text-foreground">
              {searchQuery
                ? "No matching deadlines"
                : "No upcoming deadlines"}
            </p>

            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              {searchQuery
                ? "Try a different search term."
                : "No incomplete tasks currently have a deadline."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingTasks
              .map((task, index) => {
                const deadline =
                  task.deadline as string

                const isUrgent =
                  isUrgentDeadline(deadline)

                return (
                  <motion.button
                    type="button"
                    key={task.task_id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05,
                    }}
                    onClick={() =>
                      router.push("/tasks")
                    }
                    className="group flex w-full items-center justify-between gap-4 rounded-xl border border-border/60 p-4 text-left transition-all hover:border-primary/50 hover:bg-muted/30"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isUrgent
                            ? "bg-danger/10 text-danger"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isUrgent ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <Calendar className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                          {task.title}
                        </h3>

                        <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                          {task.source}
                        </p>
                      </div>
                    </div>


                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isUrgent
                            ? "text-danger"
                            : "text-foreground"
                        }`}
                      >
                        Due{" "}
                        {formatDeadline(deadline)}
                      </span>

                      <TaskStatusBadge
                        status={task.status}
                      />
                    </div>
                  </motion.button>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}