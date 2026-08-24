"use client"

import {
  Suspense,
  useEffect,
  useState,
} from "react"

import {
  AlertCircle,
  CheckCircle2,
  FileSignature,
  Loader2,
  Mail,
  MailCheck,
  Monitor,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  useSearchParams,
} from "next/navigation"

import {
  useAuth,
} from "@/components/auth/AuthProvider"

import {
  ThemeToggle,
} from "@/components/ui/theme-toggle"
import { MembersSection } from "@/components/settings/MembersSection"

import {
  ApiError,
  connectDocuSign,
  connectGmail,
  syncGmailEmails,
} from "@/lib/api"


type BannerState =
  | { kind: "connected" }
  | { kind: "error" }
  | null


function SettingsContent() {
  const {
    user,
  } = useAuth()

  const searchParams = useSearchParams()

  const [gmailBanner, setGmailBanner] =
    useState<BannerState>(null)

  const [docusignBanner, setDocusignBanner] =
    useState<BannerState>(null)

  const [isConnectingGmail, setIsConnectingGmail] =
    useState(false)

  const [isConnectingDocusign, setIsConnectingDocusign] =
    useState(false)

  const [isSyncing, setIsSyncing] =
    useState(false)

  const [syncResultCount, setSyncResultCount] =
    useState<number | null>(null)

  const [syncError, setSyncError] =
    useState<string | null>(null)

  const [docusignError, setDocusignError] =
    useState<string | null>(null)

  const displayName =
    user?.full_name?.trim() ||
    user?.email.split("@")[0] ||
    "User"

  useEffect(() => {
    const gmailParam = searchParams.get("gmail")

    if (gmailParam === "connected") {
      setGmailBanner({ kind: "connected" })
    } else if (gmailParam === "error") {
      setGmailBanner({ kind: "error" })
    }

    const docusignParam = searchParams.get("docusign")

    if (docusignParam === "connected") {
      setDocusignBanner({ kind: "connected" })
    } else if (docusignParam === "error") {
      setDocusignBanner({ kind: "error" })
    }
  }, [searchParams])


  async function handleConnectGmail(): Promise<void> {
    try {
      setIsConnectingGmail(true)

      const { authorization_url } =
        await connectGmail()

      window.location.assign(authorization_url)
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to start the Gmail connection. Please try again."

      setGmailBanner({ kind: "error" })
      setSyncError(message)
      setIsConnectingGmail(false)
    }
  }


  async function handleConnectDocusign(): Promise<void> {
    try {
      setIsConnectingDocusign(true)
      setDocusignError(null)

      const { authorization_url } =
        await connectDocuSign()

      window.location.assign(authorization_url)
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to start the DocuSign connection. Please try again."

      setDocusignBanner({ kind: "error" })
      setDocusignError(message)
      setIsConnectingDocusign(false)
    }
  }


  async function handleSyncNow(): Promise<void> {
    try {
      setIsSyncing(true)
      setSyncError(null)
      setSyncResultCount(null)

      const createdTasks = await syncGmailEmails()

      setSyncResultCount(createdTasks.length)
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to sync Gmail right now. Please try again."

      setSyncError(message)
    } finally {
      setIsSyncing(false)
    }
  }


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
        {gmailBanner?.kind === "connected" && (
          <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Gmail connected successfully. You can now sync
            emails into tasks.
          </div>
        )}

        {gmailBanner?.kind === "error" && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            <AlertCircle className="h-5 w-5 shrink-0" />
            Could not connect Gmail. Please try again.
          </div>
        )}

        {docusignBanner?.kind === "connected" && (
          <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            DocuSign connected successfully. Approved
            signature tasks can now be sent for signing.
          </div>
        )}

        {docusignBanner?.kind === "error" && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            <AlertCircle className="h-5 w-5 shrink-0" />
            Could not connect DocuSign. Please try again.
          </div>
        )}

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
              Email Intake
            </h2>

            <p className="text-sm text-muted-foreground">
              Connect Gmail so Clerkly can turn paperwork
              emails into tasks automatically.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <MailCheck
                className={`h-5 w-5 ${
                  user?.gmail_connected
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              />

              <div>
                <p className="font-medium text-foreground">
                  {user?.gmail_connected
                    ? "Gmail connected"
                    : "Gmail not connected"}
                </p>

                <p className="text-sm text-muted-foreground">
                  {user?.gmail_connected
                    ? "Clerkly can read new emails for paperwork."
                    : "Connect your Gmail account to enable email intake."}
                </p>
              </div>
            </div>

            {!user?.gmail_connected ? (
              <button
                type="button"
                disabled={isConnectingGmail}
                onClick={() =>
                  void handleConnectGmail()
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConnectingGmail && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {isConnectingGmail
                  ? "Redirecting..."
                  : "Connect Gmail"}
              </button>
            ) : (
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => void handleSyncNow()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}

                {isSyncing ? "Syncing..." : "Sync now"}
              </button>
            )}
          </div>

          {syncResultCount !== null && (
            <p className="mt-3 text-sm text-success">
              Sync complete — {syncResultCount}{" "}
              {syncResultCount === 1 ? "task" : "tasks"}{" "}
              created from recent emails.
            </p>
          )}

          {syncError && (
            <p className="mt-3 text-sm text-danger">
              {syncError}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Signature Intake
            </h2>

            <p className="text-sm text-muted-foreground">
              Connect DocuSign (sandbox) so approved
              signature-required tasks can be sent out for
              real signing.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <FileSignature
                className={`h-5 w-5 ${
                  user?.docusign_connected
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              />

              <div>
                <p className="font-medium text-foreground">
                  {user?.docusign_connected
                    ? "DocuSign connected"
                    : "DocuSign not connected"}
                </p>

                <p className="text-sm text-muted-foreground">
                  {user?.docusign_connected
                    ? "Signature tasks can be sent for signing from the Tasks page."
                    : "Connect DocuSign to enable signature requests."}
                </p>
              </div>
            </div>

            {!user?.docusign_connected && (
              <button
                type="button"
                disabled={isConnectingDocusign}
                onClick={() =>
                  void handleConnectDocusign()
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConnectingDocusign && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {isConnectingDocusign
                  ? "Redirecting..."
                  : "Connect DocuSign"}
              </button>
            )}
          </div>

          {docusignError && (
            <p className="mt-3 text-sm text-danger">
              {docusignError}
            </p>
          )}
        </section>

        <MembersSection />

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


export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">
          Loading settings...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}