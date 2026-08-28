"use client"

import {
  useEffect,
} from "react"

import type { ReactNode } from "react"

import {
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"

import {
  usePathname,
  useRouter,
} from "next/navigation"

import {
  useAuth,
} from "@/components/auth/AuthProvider"

import {
  PolicyAgreementModal,
} from "@/components/auth/PolicyAgreementModal"

import {
  Header,
} from "@/components/layout/Header"

import {
  Sidebar,
} from "@/components/layout/Sidebar"


const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
]


export function AppShell({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const {
    isAuthenticated,
    isLoading,
    policyAccepted,
    isPolicyLoading,
    policyError,
    recheckPolicy,
    onPolicyAccepted,
  } = useAuth()

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/invite/")


  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      !isPublicRoute
    ) {
      router.replace("/login")
    }
  }, [
    isAuthenticated,
    isLoading,
    isPublicRoute,
    router,
  ])


  if (isPublicRoute) {
    return (
      <main className="min-h-screen bg-background">
        {children}
      </main>
    )
  }


  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-sm">
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }


  // ── Policy loading state ─────────────────────────
  // Show a spinner while we are checking the policy
  // status from the backend.
  if (isPolicyLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-sm">
            Verifying policy status…
          </p>
        </div>
      </div>
    )
  }


  // ── Policy error state ───────────────────────────
  // If the policy status check failed, show an error
  // with a retry button rather than silently allowing
  // access or permanently blocking the user.
  if (policyError && !policyAccepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />

            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">
                Policy Check Failed
              </h2>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {policyError}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void recheckPolicy()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Policy acceptance modal — blocks interaction
          with the dashboard until the user accepts. */}
      {!policyAccepted && (
        <PolicyAgreementModal
          onAccepted={onPolicyAccepted}
        />
      )}
    </div>
  )
}