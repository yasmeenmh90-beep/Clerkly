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
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  PenTool,
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


interface PriorityTasksProps {
  searchQuery?: string
}


function formatDeadline(
  deadline: string | null,
): string {
  if (!deadline) {
    return "No deadline"
  }

  const parsedDeadline =
    new Date(`${deadline}T00:00:00`)

  if (Number.isNaN(parsedDeadline.getTime())) {
    return deadline
  }

  return parsedDeadline.toLocaleDateString()
}


function formatPayment(
  task: Task,
): string {
  if (
    task.payment_amount === null ||
    task.payment_amount === undefined
  ) {
    return "Amount not provided"
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: task.currency ?? "AED",
  }).format(task.payment_amount)
}


export function PriorityTasks({
  searchQuery = "",
}: PriorityTasksProps) {
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
          "Failed to load priority tasks",
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


  const priorityTasks = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase()

    return tasks.filter((task) => {
      const requiresAttention = [
        "pending",
        "awaiting_approval",
        "approved",
        "failed",
      ].includes(task.status)

      const matchesSearch =
        normalizedSearch.length === 0 ||
        task.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        task.source
          .toLowerCase()
          .includes(normalizedSearch) ||
        (task.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (task.required_action ?? "")
          .toLowerCase()
          .includes(normalizedSearch)

      return requiresAttention && matchesSearch
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
            Needs Attention
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Tasks requiring your immediate action
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


        <div className="relative min-h-[200px] max-h-[420px] flex-1 divide-y divide-border overflow-y-auto">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : priorityTasks.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success opacity-80" />
            </div>

            <p className="text-sm font-medium text-foreground">
              {searchQuery
                ? "No matching priority tasks"
                : "No priority tasks"}
            </p>

            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              {searchQuery
                ? "Try a different search term."
                : "You are all caught up on urgent items."}
            </p>
          </div>
        ) : (
          priorityTasks
            .map((task, index) => (
              <motion.button
                type="button"
                key={task.task_id}
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                }}
                onClick={() =>
                  router.push("/tasks")
                }
                className="group relative w-full cursor-pointer p-5 text-left transition-all duration-200 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:scale-[0.99]"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 rounded-lg border border-border bg-accent/50 p-2 text-foreground">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        {task.source} • Due{" "}
                        {formatDeadline(
                          task.deadline,
                        )}
                      </p>

                      {(task.owner_name || task.owner_email) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Created by <span className="font-medium text-foreground/80">{task.owner_name || task.owner_email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <TaskStatusBadge
                    status={task.status}
                  />
                </div>


                <div className="mt-4 flex flex-wrap items-center gap-2 pl-11">
                  {task.requires_payment && (
                    <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <Banknote className="h-3 w-3" />

                      <span>
                        {formatPayment(task)}
                      </span>
                    </div>
                  )}

                  {task.requires_signature && (
                    <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <PenTool className="h-3 w-3" />

                      <span>
                        Signature required
                      </span>
                    </div>
                  )}
                </div>


                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </motion.button>
            ))
        )}
      </div>
    </div>
  )
}