"use client"

import Link from "next/link"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  AlertCircle,
  Banknote,
  Check,
  Clock,
  FileText,
  Filter,
  Loader2,
  PenTool,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react"

import type {
  Task,
  TaskStatus,
} from "@/types"

import {
  TaskStatusBadge,
} from "@/components/ui/badges"

import {
  ApiError,
  approveRequest,
  createCheckoutSession,
  executeTask,
  getTasks,
  rejectRequest,
  sendTaskForSignature,
} from "@/lib/api"

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


function formatPayment(task: Task): string {
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


function formatSource(
  source: Task["source"],
): string {
  return (
    source.charAt(0).toUpperCase() +
    source.slice(1)
  )
}


function formatAction(
  action: string | null,
): string {
  return (
    action ??
    "No required action provided"
  )
}


export default function TasksPage() {
  const [tasks, setTasks] =
    useState<Task[]>([])

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isUpdating, setIsUpdating] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [actionError, setActionError] =
    useState<string | null>(null)

  const [searchQuery, setSearchQuery] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState<TaskStatus | "all">("all")


  async function loadTasks(): Promise<void> {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getTasks({
        page: 1,
        page_size: 100,
      })

      setTasks(data)
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message)
      } else {
        setError(
          "Unable to load tasks. Please try again.",
        )
      }
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    void loadTasks()
  }, [])


  const filteredTasks = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase()

    return tasks.filter((task) => {
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
          .includes(normalizedSearch)

      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [
    tasks,
    searchQuery,
    statusFilter,
  ])


  function updateTaskInState(
    updatedTask: Task,
  ): void {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.task_id === updatedTask.task_id
          ? updatedTask
          : task,
      ),
    )

    setSelectedTask(updatedTask)
  }


  async function performTaskAction(
    action: () => Promise<Task>,
  ): Promise<void> {
    try {
      setIsUpdating(true)
      setActionError(null)

      const updatedTask = await action()

      updateTaskInState(updatedTask)
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setActionError(requestError.message)
      } else {
        setActionError(
          "Unable to update this task. Please try again.",
        )
      }
    } finally {
      setIsUpdating(false)
    }
  }


  function handleApprove(
    taskId: string,
  ): void {
    void performTaskAction(() =>
      approveRequest(taskId),
    )
  }


  function handleReject(
    taskId: string,
  ): void {
    void performTaskAction(() =>
      rejectRequest(taskId),
    )
  }


  async function handlePayment(
    task: Task,
  ): Promise<void> {
    try {
      setIsUpdating(true)
      setActionError(null)

      const checkout =
        await createCheckoutSession(task.task_id)

      if (!checkout.checkout_url) {
        setActionError(
          "Stripe did not return a Checkout URL.",
        )

        return
      }

      window.location.assign(
        checkout.checkout_url,
      )
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setActionError(requestError.message)
      } else {
        setActionError(
          "Unable to start payment. Please try again.",
        )
      }
    } finally {
      setIsUpdating(false)
    }
  }


  function handleSendForSignature(
    task: Task,
  ): void {
    void performTaskAction(() =>
      sendTaskForSignature(task.task_id),
    )
  }


  function handleExecute(task: Task): void {
    void performTaskAction(() =>
      executeTask(task.task_id),
    )
  }


  function openTask(task: Task): void {
    setActionError(null)
    setSelectedTask(task)
  }


  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <p>Loading tasks...</p>
      </div>
    )
  }


  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 text-danger">
        <AlertCircle className="h-10 w-10" />

        <p className="font-medium">
          {error}
        </p>

        <button
          type="button"
          onClick={() => void loadTasks()}
          className="mt-2 rounded-lg bg-muted px-4 py-2 text-sm text-foreground hover:bg-muted/80"
        >
          Try Again
        </button>
      </div>
    )
  }


  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground transition-all focus:border-primary focus:outline-none"
          />
        </div>


        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | TaskStatus
                    | "all",
                )
              }
              className="h-10 min-w-0 flex-1 cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none sm:w-44"
            >
              <option value="all">
                All statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="awaiting_approval">
                Awaiting approval
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="in_progress">
                In progress
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="failed">
                Failed
              </option>
            </select>
          </div>


          <Link
            href="/tasks/new"
            className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Link>
        </div>
      </div>


      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="col-span-full rounded-xl border border-border bg-card py-20 text-center text-muted-foreground shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                <Filter className="h-8 w-8 opacity-40" />
              </div>

              <h3 className="mb-1 text-lg font-medium text-foreground">
                No tasks found
              </h3>

              <p className="mx-auto max-w-sm text-sm">
                No tasks match the selected
                search and status filters.
              </p>

              <Link
                href="/tasks/new"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create your first task
              </Link>
            </motion.div>
          )}


          {filteredTasks.map(
            (task, index) => (
              <motion.button
                type="button"
                layout
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                }}
                key={task.task_id}
                onClick={() =>
                  openTask(task)
                }
                className="group flex flex-col rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <TaskStatusBadge
                    status={task.status}
                  />

                  <span className="rounded-md bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
                    {task.source}
                  </span>
                </div>

                <h3 className="mb-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {task.title}
                </h3>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {task.description ??
                    formatAction(
                      task.required_action,
                    )}
                </p>

                {(task.owner_name || task.owner_email) && (
                  <p className="mb-4 text-xs text-muted-foreground">
                    Created by <span className="font-medium text-foreground/80">{task.owner_name || task.owner_email}</span>
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />

                    {formatDeadline(
                      task.deadline,
                    )}
                  </span>

                  <div className="flex gap-2">
                    {task.requires_payment && (
                      <span title="Requires payment">
                        <Banknote className="h-4 w-4 text-warning" />
                      </span>
                    )}

                    {task.requires_signature && (
                      <span title="Requires signature">
                        <PenTool className="h-4 w-4 text-primary" />
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ),
          )}
        </AnimatePresence>
      </div>


      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 20,
              }}
              className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
            >
              <div className="relative flex items-start justify-between border-b border-border p-6">
                <div className="absolute left-0 top-0 h-1 w-full bg-primary" />

                <div>
                  <div className="mb-3 mt-2">
                    <TaskStatusBadge
                      status={
                        selectedTask.status
                      }
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedTask.title}
                  </h2>

                  <p className="mt-1 flex items-center gap-1 text-sm capitalize text-muted-foreground">
                    <FileText className="h-4 w-4" />

                    {formatSource(
                      selectedTask.source,
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTask(null)
                  }
                  className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-muted/80"
                  aria-label="Close task details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>


              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                    <p className="mb-1 text-xs text-muted-foreground">
                      Source
                    </p>

                    <p className="text-sm font-medium capitalize">
                      {selectedTask.source}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                    <p className="mb-1 text-xs text-muted-foreground">
                      Deadline
                    </p>

                    <p className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-3.5 w-3.5" />

                      {formatDeadline(
                        selectedTask.deadline,
                      )}
                    </p>
                  </div>
                </div>

                {(selectedTask.owner_name || selectedTask.owner_email) && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">
                      Created by
                    </h4>
                    <p className="text-sm font-medium text-foreground">
                      {selectedTask.owner_name || selectedTask.owner_email}
                    </p>
                    {selectedTask.owner_name && selectedTask.owner_email && (
                      <p className="text-sm text-muted-foreground">
                        {selectedTask.owner_email}
                      </p>
                    )}
                  </div>
                )}

                {(selectedTask.approved_by_name || selectedTask.approved_by_email) && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">
                      Approved by
                    </h4>
                    <p className="text-sm font-medium text-foreground">
                      {selectedTask.approved_by_name || selectedTask.approved_by_email}
                    </p>
                    {selectedTask.approved_by_name && selectedTask.approved_by_email && (
                      <p className="text-sm text-muted-foreground">
                        {selectedTask.approved_by_email}
                      </p>
                    )}
                  </div>
                )}


                <div>
                  <h4 className="mb-2 text-sm font-semibold text-foreground">
                    Description
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    {selectedTask.description ??
                      "No description provided"}
                  </p>
                </div>


                <div>
                  <h4 className="mb-2 text-sm font-semibold text-foreground">
                    Required action
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    {formatAction(
                      selectedTask.required_action,
                    )}
                  </p>
                </div>


                {(selectedTask.requires_payment ||
                  selectedTask.requires_signature) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Requirements
                    </h4>

                    {selectedTask.requires_payment && (
                      <div className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-5 w-5 text-warning" />

                          <span className="text-sm font-medium">
                            Payment required
                          </span>
                        </div>

                        <span className="font-bold">
                          {formatPayment(
                            selectedTask,
                          )}
                        </span>
                      </div>
                    )}

                    {selectedTask.requires_signature && (
                      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-primary">
                        <PenTool className="h-5 w-5" />

                        <span className="text-sm font-medium">
                          Signature required
                        </span>
                      </div>
                    )}
                  </div>
                )}


                <div className="relative space-y-3 border-t border-border pt-4">
                  {isUpdating && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/50 backdrop-blur-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}

                  <h4 className="text-sm font-semibold text-foreground">
                    Available actions
                  </h4>

                  {actionError && (
                    <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                      <span>
                        {actionError}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selectedTask.status ===
                      "awaiting_approval" && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleApprove(
                              selectedTask.task_id,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleReject(
                              selectedTask.task_id,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}


                    {selectedTask.status === "approved" && (
                      <>
                        {/*
                          A task can need payment, signature,
                          both, or neither. Show one button per
                          outstanding requirement instead of a
                          single button that only ever checked
                          requires_payment — that bug is why
                          signature-only tasks used to fall
                          through to plain Execute and get
                          blocked by the backend's safety check.
                        */}

                        {selectedTask.requires_payment && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void handlePayment(selectedTask)
                            }
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Banknote className="h-4 w-4" />
                            )}

                            {isUpdating
                              ? "Please wait..."
                              : "Continue to payment"}
                          </button>
                        )}

                        {selectedTask.requires_signature && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleSendForSignature(selectedTask)
                            }
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <PenTool className="h-4 w-4" />
                            )}

                            {isUpdating
                              ? "Please wait..."
                              : "Send for signature"}
                          </button>
                        )}

                        {!selectedTask.requires_payment &&
                          !selectedTask.requires_signature && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleExecute(selectedTask)
                              }
                              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}

                              {isUpdating
                                ? "Please wait..."
                                : "Execute"}
                            </button>
                          )}
                      </>
                    )}


                    {![
                      "awaiting_approval",
                      "approved",
                    ].includes(
                      selectedTask.status,
                    ) && (
                      <p className="text-sm text-muted-foreground">
                        No actions are available
                        for a{" "}
                        {selectedTask.status.replaceAll(
                          "_",
                          " ",
                        )}{" "}
                        task.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}