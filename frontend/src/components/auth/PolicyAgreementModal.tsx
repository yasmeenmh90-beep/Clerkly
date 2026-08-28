"use client"

import {
  useCallback,
  useState,
} from "react"

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  ScrollText,
  Shield,
} from "lucide-react"

import {
  acceptPolicy,
  ApiError,
  CURRENT_POLICY_VERSION,
} from "@/lib/api"


interface PolicyAgreementModalProps {
  onAccepted: () => void
}


export function PolicyAgreementModal({
  onAccepted,
}: PolicyAgreementModalProps) {
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const handleAccept = useCallback(async (): Promise<void> => {
    if (!agreed || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      await acceptPolicy(CURRENT_POLICY_VERSION)

      onAccepted()
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message)
      } else {
        setError(
          "Unable to record your acceptance. Please try again.",
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [agreed, isSubmitting, onAccepted])


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-dialog-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2
              id="policy-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              Terms &amp; Policy Agreement
            </h2>

            <p className="text-sm text-muted-foreground">
              Please review and accept before continuing
            </p>
          </div>
        </div>


        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Before you can use Clerkly, please review and accept our
            Terms of Service and Privacy Policy. These documents
            describe how we handle your data and the rules for using
            the platform.
          </p>


          {/* ── Policy sections ── */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-medium text-foreground">
                  Terms of Service
                </h3>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Governs your use of the Clerkly platform, including
                  acceptable use, account responsibilities, and
                  service limitations.
                </p>

                <p className="mt-1 text-xs italic text-muted-foreground/70">
                  Full terms document is under legal review and will
                  be linked here when published.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-medium text-foreground">
                  Privacy Policy
                </h3>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Describes how Clerkly collects, uses, stores, and
                  protects your personal information and uploaded
                  documents.
                </p>

                <p className="mt-1 text-xs italic text-muted-foreground/70">
                  Full privacy document is under legal review and
                  will be linked here when published.
                </p>
              </div>
            </div>
          </div>


          {/* ── Error ── */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}


          {/* ── Checkbox ── */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) =>
                setAgreed(event.target.checked)
              }
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
              aria-describedby="agreement-description"
            />

            <span
              id="agreement-description"
              className="text-sm leading-relaxed text-foreground"
            >
              I have read and agree to the Clerkly Terms of Service
              and Privacy Policy.
            </span>
          </label>
        </div>


        {/* ── Footer ── */}
        <div className="border-t border-border px-6 py-4">
          <button
            type="button"
            disabled={!agreed || isSubmitting}
            onClick={() => void handleAccept()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Accepting…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Accept &amp; Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
