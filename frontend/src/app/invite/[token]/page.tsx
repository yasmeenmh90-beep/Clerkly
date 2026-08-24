"use client"

import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, AlertCircle, Building2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { acceptInvite, ApiError } from "@/lib/api"

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const { isAuthenticated, isLoading: isAuthLoading, refreshOrganizations } = useAuth()
  
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAccept = async () => {
    if (!isAuthenticated) return

    try {
      setIsAccepting(true)
      setError(null)
      
      await acceptInvite(token)
      setSuccess(true)
      
      await refreshOrganizations()

      // Note: We cannot call switchOrganization() here because acceptInvite() 
      // returns an OrganizationMember which lacks an organization_id, and 
      // refreshOrganizations() returns Promise<void>. 
      
      // We rely on the user to manually switch, or for the backend to be updated 
      // to return the organization_id from acceptInvite().
      
      router.push("/dashboard")
      
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to accept invitation. Please try again.")
      }
      setIsAccepting(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md p-8 rounded-2xl border border-border/60 bg-card shadow-lg text-center space-y-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
          <p className="text-muted-foreground">
            You have successfully joined the organization. Redirecting to your dashboard...
          </p>
          <div className="pt-4 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border/60 bg-card shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-6 mx-auto">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Organization Invite
          </h1>
          <p className="text-muted-foreground">
            You've been invited to join an organization.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 flex gap-3 items-start rounded-lg border border-danger/20 bg-danger/5 text-sm text-danger">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {isAuthenticated ? (
          <div className="space-y-4">
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="flex w-full items-center justify-center gap-2 h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              disabled={isAccepting}
              className="w-full h-11 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-accent/50 text-sm text-center text-muted-foreground">
              Please sign in or create an account to accept this invitation.
            </div>
            <div className="space-y-3">
              <Link
                href={`/login?returnUrl=${encodeURIComponent(`/invite/${token}`)}`}
                className="flex w-full items-center justify-center h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Log In
              </Link>
              <Link
                href={`/register?returnUrl=${encodeURIComponent(`/invite/${token}`)}`}
                className="flex w-full items-center justify-center h-11 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
