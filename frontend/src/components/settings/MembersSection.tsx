"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Loader2, MoreVertical, Trash2, Shield, Mail } from "lucide-react"
import { getOrganizationMembers, removeMember, OrganizationMember, OrganizationInvite, ApiError } from "@/lib/api"
import { mockGetOrganizationInvites, mockCancelInvite, mockResendInvite, mockUpdateMemberRole } from "@/lib/mock-members-api"
import { InviteMemberModal } from "./InviteMemberModal"

export function MembersSection() {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [invites, setInvites] = useState<OrganizationInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [membersData, invitesData] = await Promise.all([
        getOrganizationMembers(),
        mockGetOrganizationInvites()
      ])
      setMembers(membersData)
      setInvites(invitesData)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to load members and invitations.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return
    try {
      setIsActionLoading(userId)
      await removeMember(userId)
      setMembers(members.filter(m => m.user_id !== userId))
    } catch (err) {
      alert("Failed to remove member.")
    } finally {
      setIsActionLoading(null)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm("Cancel this invitation?")) return
    try {
      setIsActionLoading(inviteId)
      await mockCancelInvite(inviteId)
      setInvites(invites.filter(i => i.invite_id !== inviteId))
    } catch (err) {
      alert("Failed to cancel invitation.")
    } finally {
      setIsActionLoading(null)
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      setIsActionLoading(`resend-${inviteId}`)
      await mockResendInvite(inviteId)
      alert("Invitation resent successfully.")
    } catch (err) {
      alert("Failed to resend invitation.")
    } finally {
      setIsActionLoading(null)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    const str = name || email
    return str.substring(0, 2).toUpperCase()
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members & Invites
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage who has access to this organization.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-danger/20 bg-danger/5 text-sm text-danger">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Members */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Active Members ({members.length})</h3>
            <div className="rounded-lg border border-border overflow-hidden bg-background">
              {members.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No members found.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {members.map(member => (
                    <div key={member.membership_id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                          {getInitials(member.full_name, member.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {member.full_name || member.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                          <Shield className="w-3 h-3" />
                          {member.role}
                        </span>
                        
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={isActionLoading === member.user_id}
                          className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-md transition-colors disabled:opacity-50"
                          title="Remove Member"
                        >
                          {isActionLoading === member.user_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Pending Invites ({invites.length})</h3>
              <div className="rounded-lg border border-border overflow-hidden bg-background">
                <div className="divide-y divide-border">
                  {invites.map(invite => (
                    <div key={invite.invite_id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {invite.invited_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(invite.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                          {invite.role}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResendInvite(invite.invite_id)}
                            disabled={!!isActionLoading}
                            className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                          >
                            {isActionLoading === `resend-${invite.invite_id}` ? "Sending..." : "Resend"}
                          </button>
                          <span className="text-border">•</span>
                          <button
                            onClick={() => handleCancelInvite(invite.invite_id)}
                            disabled={!!isActionLoading}
                            className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
                          >
                            {isActionLoading === invite.invite_id ? "Canceling..." : "Cancel"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          setIsInviteModalOpen(false)
          loadData() // Refresh list
        }}
      />
    </section>
  )
}
