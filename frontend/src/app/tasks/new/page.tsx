"use client"

import {
  useState,
} from "react"

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileCheck2,
  Loader2,
} from "lucide-react"

import Link from "next/link"

import {
  useRouter,
} from "next/navigation"

import type { Task } from "@/types"

import {
  ApiError,
  createTask,
} from "@/lib/api"


export default function CreateTaskPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] =
    useState("")
  const [deadline, setDeadline] =
    useState("")
  const [requiredAction, setRequiredAction] =
    useState("")

  const [
    requiresSignature,
    setRequiresSignature,
  ] = useState(false)

  const [
    requiresPayment,
    setRequiresPayment,
  ] = useState(false)

  const [paymentAmount, setPaymentAmount] =
    useState("")

  const [currency, setCurrency] =
    useState("AED")

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault()

    const cleanedTitle = title.trim()
    const cleanedDescription =
      description.trim()
    const cleanedRequiredAction =
      requiredAction.trim()

    if (!cleanedTitle) {
      setError("Task title is required.")
      return
    }

    if (!cleanedRequiredAction) {
      setError(
        "Required action is required.",
      )
      return
    }

    let parsedPaymentAmount:
      | number
      | null = null

    if (requiresPayment) {
      parsedPaymentAmount =
        Number(paymentAmount)

      if (
        !paymentAmount ||
        Number.isNaN(parsedPaymentAmount) ||
        parsedPaymentAmount < 0
      ) {
        setError(
          "Enter a valid payment amount.",
        )
        return
      }
    }


    const taskId =
      `task_${crypto.randomUUID()
        .replaceAll("-", "")
        .slice(0, 12)}`


    const task: Task = {
      task_id: taskId,
      title: cleanedTitle,

      description:
        cleanedDescription || null,

      source: "manual",

      // Safety boundary:
      // every new task requires approval.
      status: "awaiting_approval",

      deadline:
        deadline || null,

      required_action:
        cleanedRequiredAction,

      requires_signature:
        requiresSignature,

      requires_payment:
        requiresPayment,

      payment_amount:
        requiresPayment
          ? parsedPaymentAmount
          : null,

      currency:
        requiresPayment
          ? currency.trim().toUpperCase()
          : null,

      approval_required: true,
    }


    try {
      setIsSubmitting(true)
      setError(null)

      await createTask(task)

      router.push("/tasks")
      router.refresh()
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message)
      } else {
        setError(
          "Unable to create the task. Please try again.",
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="mx-auto max-w-3xl pb-8">
      <div className="mb-6">
        <Link
          href="/tasks"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tasks
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create Task
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Create a real task that will be saved
          to your Clerkly account.
        </p>
      </div>


      <form
        onSubmit={(event) =>
          void handleSubmit(event)
        }
        className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}


        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-foreground"
          >
            Task title
          </label>

          <input
            id="title"
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Renew vehicle registration"
            className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>


        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-foreground"
          >
            Description
          </label>

          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Describe the task..."
            className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>


        <div className="space-y-2">
          <label
            htmlFor="required-action"
            className="text-sm font-medium text-foreground"
          >
            Required action
          </label>

          <textarea
            id="required-action"
            rows={3}
            required
            value={requiredAction}
            onChange={(event) =>
              setRequiredAction(
                event.target.value,
              )
            }
            placeholder="Explain what must be completed..."
            className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>


        <div className="space-y-2">
          <label
            htmlFor="deadline"
            className="text-sm font-medium text-foreground"
          >
            Deadline
          </label>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(event) =>
                setDeadline(event.target.value)
              }
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>


        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-base font-semibold text-foreground">
            Requirements
          </h2>


          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Signature required
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                The task requires a signature.
              </p>
            </div>

            <input
              type="checkbox"
              checked={requiresSignature}
              onChange={(event) =>
                setRequiresSignature(
                  event.target.checked,
                )
              }
              className="h-5 w-5 accent-primary"
            />
          </label>


          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Payment required
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Payment must be completed for
                this task.
              </p>
            </div>

            <input
              type="checkbox"
              checked={requiresPayment}
              onChange={(event) => {
                setRequiresPayment(
                  event.target.checked,
                )

                if (!event.target.checked) {
                  setPaymentAmount("")
                }
              }}
              className="h-5 w-5 accent-primary"
            />
          </label>


          {requiresPayment && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-warning/20 bg-warning/5 p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="payment-amount"
                  className="text-sm font-medium text-foreground"
                >
                  Payment amount
                </label>

                <input
                  id="payment-amount"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(event) =>
                    setPaymentAmount(
                      event.target.value,
                    )
                  }
                  placeholder="350"
                  className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>


              <div className="space-y-2">
                <label
                  htmlFor="currency"
                  className="text-sm font-medium text-foreground"
                >
                  Currency
                </label>

                <select
                  id="currency"
                  value={currency}
                  onChange={(event) =>
                    setCurrency(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
                >
                  <option value="AED">AED</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>
            </div>
          )}
        </div>


        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

            <div>
              <p className="text-sm font-medium text-foreground">
                Approval required
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                This task will be saved with
                awaiting-approval status. It cannot
                execute until you approve it.
              </p>
            </div>
          </div>
        </div>


        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/tasks"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {isSubmitting
              ? "Creating task..."
              : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  )
}