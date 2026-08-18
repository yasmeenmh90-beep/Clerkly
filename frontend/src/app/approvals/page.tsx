"use client"

import {
  useEffect,
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
  Loader2,
  PenTool,
  X,
} from "lucide-react"

import type { Task } from "@/types"

import {
  ApiError,
  approveRequest,
  getApprovals,
  rejectRequest,
} from "@/lib/api"


interface ToastState {
  message: string
  type: "success" | "error"
}


function formatDeadline(deadline: string | null): string {
  if (!deadline) {
    return "No deadline"
  }

  return new Date(
    `${deadline}T00:00:00`,
  ).toLocaleDateString()
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


export default function ApprovalsPage() {
  const [approvals, setApprovals] =
    useState<Task[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [toast, setToast] =
    useState<ToastState | null>(null)

  const [processingId, setProcessingId] =
    useState<string | null>(null)


  async function loadApprovals(): Promise<void> {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getApprovals()

      setApprovals(data)
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message)
      } else {
        setError(
          "Unable to load approvals. Please try again.",
        )
      }
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    void loadApprovals()
  }, [])


  function showToast(
    message: string,
    type: ToastState["type"],
  ): void {
    setToast({
      message,
      type,
    })

    window.setTimeout(() => {
      setToast(null)
    }, 3000)
  }


  async function handleApprove(
    taskId: string,
  ): Promise<void> {
    try {
      setProcessingId(taskId)

      await approveRequest(taskId)

      setApprovals((currentApprovals) =>
        currentApprovals.filter(
          (task) => task.task_id !== taskId,
        ),
      )

      showToast(
        "Task approved successfully",
        "success",
      )
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : "Failed to approve task"

      showToast(message, "error")
    } finally {
      setProcessingId(null)
    }
  }


  async function handleReject(
    taskId: string,
  ): Promise<void> {
    try {
      setProcessingId(taskId)

      await rejectRequest(taskId)

      setApprovals((currentApprovals) =>
        currentApprovals.filter(
          (task) => task.task_id !== taskId,
        ),
      )

      showToast(
        "Task rejected successfully",
        "success",
      )
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : "Failed to reject task"

      showToast(message, "error")
    } finally {
      setProcessingId(null)
    }
  }


  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <p>Loading approvals...</p>
      </div>
    )
  }


  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 text-danger">
        <AlertCircle className="h-10 w-10" />

        <p className="font-medium">{error}</p>

        <button
          type="button"
          onClick={() => void loadApprovals()}
          className="mt-2 rounded-lg bg-muted px-4 py-2 text-sm text-foreground hover:bg-muted/80"
        >
          Try Again
        </button>
      </div>
    )
  }


  return (
    <div className="relative mx-auto max-w-4xl space-y-6 pb-8">
      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
          Pending Approvals
        </h2>

        <p className="text-sm text-muted-foreground">
          Review tasks waiting for your approval.
        </p>
      </div>


      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {approvals.length === 0 && (
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
              className="rounded-xl border border-border bg-card py-20 text-center text-muted-foreground shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>

              <h3 className="mb-1 text-lg font-medium text-foreground">
                No approvals waiting
              </h3>

              <p className="mx-auto max-w-sm text-sm">
                You are all caught up. No tasks currently
                require your approval.
              </p>
            </motion.div>
          )}


          {approvals.map((task, index) => (
            <motion.div
              layout
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 20,
                scale: 0.95,
              }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
              }}
              key={task.task_id}
              className="flex flex-col justify-between gap-6 rounded-xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center"
            >
              <div className="flex flex-1 items-start gap-4">
                <div
                  className={`rounded-xl border p-3 ${
                    task.requires_payment
                      ? "border-warning/20 bg-warning/10 text-warning"
                      : "border-primary/20 bg-primary/10 text-primary"
                  }`}
                >
                  {task.requires_payment ? (
                    <Banknote className="h-5 w-5" />
                  ) : task.requires_signature ? (
                    <PenTool className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>


                <div>
                  <h3 className="mb-1 text-base font-semibold text-foreground">
                    {task.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 capitalize">
                      <FileText className="h-3.5 w-3.5" />

                      {task.source}
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />

                      {formatDeadline(task.deadline)}
                    </span>
                  </div>


                  {task.description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}


                  {task.requires_payment && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted px-2.5 py-1 text-sm font-medium text-foreground">
                      Payment:

                      <span className="text-warning">
                        {formatPayment(task)}
                      </span>
                    </div>
                  )}


                  {task.requires_signature && (
                    <div className="ml-2 mt-3 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-sm font-medium text-primary">
                      <PenTool className="h-3.5 w-3.5" />

                      Signature required
                    </div>
                  )}
                </div>
              </div>


              <div className="relative flex w-full items-center gap-3 md:w-auto">
                {processingId === task.task_id && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/80 backdrop-blur-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void handleReject(task.task_id)
                  }
                  disabled={
                    processingId === task.task_id
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-danger/30 hover:bg-danger/10 hover:text-danger disabled:opacity-50 md:flex-none"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleApprove(task.task_id)
                  }
                  disabled={
                    processingId === task.task_id
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 md:flex-none"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.9,
            }}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-md ${
              toast.type === "success"
                ? "border-success/20 bg-success/10"
                : "border-danger/20 bg-danger/10"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="h-5 w-5 text-success" />
            ) : (
              <AlertCircle className="h-5 w-5 text-danger" />
            )}

            <span className="text-sm font-medium text-foreground">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}