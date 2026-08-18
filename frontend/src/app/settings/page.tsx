"use client"

import {
  Mail,
  Monitor,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  useAuth,
} from "@/components/auth/AuthProvider"

import {
  ThemeToggle,
} from "@/components/ui/theme-toggle"


export default function SettingsPage() {
  const {
    user,
  } = useAuth()

  const displayName =
    user?.full_name?.trim() ||
    user?.email.split("@")[0] ||
    "User"

  return (
    <div className="mx-auto max-w-4xl pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>

        <p className="mt-1 text-muted-foreground">
          View your account and appearance settings.
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Account
            </h2>

            <p className="text-sm text-muted-foreground">
              Information from your authenticated Clerkly account.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <UserRound className="h-5 w-5 text-primary" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Full name
                </p>

                <p className="font-medium text-foreground">
                  {displayName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <Mail className="h-5 w-5 text-primary" />

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Email
                </p>

                <p className="truncate font-medium text-foreground">
                  {user?.email ?? "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <ShieldCheck className="h-5 w-5 text-success" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Account status
                </p>

                <p className="font-medium text-foreground">
                  {user?.is_active ? "Active" : "Unavailable"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Appearance
            </h2>

            <p className="text-sm text-muted-foreground">
              Choose how Clerkly appears on this device.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-primary" />

              <div>
                <p className="font-medium text-foreground">
                  Theme
                </p>

                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode.
                </p>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          Email alerts, browser notifications and automatic task assignment are not shown because those backend services are not implemented yet.
        </p>
      </div>
    </div>
  )
}