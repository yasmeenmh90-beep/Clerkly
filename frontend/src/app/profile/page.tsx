"use client"

import {
  CalendarDays,
  Loader2,
  Mail,
  UserRound,
} from "lucide-react"

import {
  useAuth,
} from "@/components/auth/AuthProvider"


function formatDate(value: string | undefined): string {
  if (!value) {
    return "Not available"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString()
}


export default function ProfilePage() {
  const {
    user,
    isLoading,
  } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Unable to load your profile.
        </p>
      </div>
    )
  }

  const displayName =
    user.full_name?.trim() ||
    user.email.split("@")[0]

  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mx-auto max-w-4xl pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My Profile
        </h1>

        <p className="mt-1 text-muted-foreground">
          Your Clerkly account information.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="flex shrink-0 flex-col items-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-background bg-primary/10 text-4xl font-bold text-primary shadow-md">
              {initials}
            </div>
          </div>

          <div className="w-full flex-1">
            <div className="mb-6 border-b border-border/50 pb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Account Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                This information comes from your authenticated Clerkly account.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="h-4 w-4" />
                  Full name
                </div>

                <p className="font-medium text-foreground">
                  {displayName}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email address
                </div>

                <p className="break-all font-medium text-foreground">
                  {user.email}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Member since
                </div>

                <p className="font-medium text-foreground">
                  {formatDate(user.created_at)}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-2 text-sm text-muted-foreground">
                  Account status
                </p>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    user.is_active
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Profile editing will become available after a secure profile-update API is implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}