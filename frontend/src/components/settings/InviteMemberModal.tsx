"use client"

import { useState } from "react"
import { Loader2, X } from "lucide-react"
import { inviteMember, OrganizationRole, ApiError } from "@/lib/api"
import { addMockInvite } from "@/lib/mock-members-api"

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function InviteMemberModal({ isOpen, onClose, onSuccess }: InviteMemberModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<OrganizationRole>("member")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const newInvite = await inviteMember(email, role)
      
      // Since we don't have a backend to store it properly for the mock view,
      // we'll push it to our mock state so it shows up in the UI immediately.
      addMockInvite(newInvite)
      
      onSuccess()
      setEmail("")
      setRole("member")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to send invitation. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Invite Member</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as OrganizationRole)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
