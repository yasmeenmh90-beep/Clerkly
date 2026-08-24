"use client"

import {
  FormEvent,
  useEffect,
  useState,
} from "react"

import {
  AlertCircle,
  FileCheck2,
  Loader2,
  Lock,
  Mail,
} from "lucide-react"

import Link from "next/link"

import {
  useRouter,
  useSearchParams,
} from "next/navigation"

import {
  useAuth,
} from "@/components/auth/AuthProvider"

import {
  ApiError,
  login,
} from "@/lib/api"


import { Suspense } from "react"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    isAuthenticated,
    isLoading: isCheckingAuthentication,
    refreshUser,
  } = useAuth()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const returnUrl = searchParams.get("returnUrl") || "/dashboard"

  useEffect(() => {
    if (
      !isCheckingAuthentication &&
      isAuthenticated
    ) {
      router.replace(returnUrl)
    }
  }, [
    isAuthenticated,
    isCheckingAuthentication,
    router,
    returnUrl,
  ])


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      await login(email, password)
      await refreshUser()

      router.replace(returnUrl)
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message)
      } else {
        setError(
          "Unable to log in. Please try again.",
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <FileCheck2 className="h-8 w-8 text-primary-foreground" />
          </div>

          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Clerkly
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your paperwork tasks
          </p>
        </div>


        <form
          onSubmit={(event) =>
            void handleSubmit(event)
          }
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xl"
        >
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}


          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>


          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>


          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {isSubmitting
              ? "Signing in..."
              : "Sign In"}
          </button>


          <p className="text-center text-sm text-muted-foreground">
            Do not have an account?{" "}

            <Link
              href={`/register${returnUrl !== "/dashboard" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`}
              className="font-medium text-primary hover:underline"
            >
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}export default function LoginPage() { return <Suspense><LoginPageContent /></Suspense> }
