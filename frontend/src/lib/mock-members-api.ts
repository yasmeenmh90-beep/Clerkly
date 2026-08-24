import { OrganizationInvite, OrganizationRole } from "./api"

// Mock state for pending invitations since there is no backend endpoint yet
let mockInvites: OrganizationInvite[] = [
  {
    invite_id: "inv_mock_1",
    organization_id: "org_mock",
    invited_email: "pending.user@example.com",
    role: "member",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    accepted_at: null,
  }
]

export async function mockGetOrganizationInvites(): Promise<OrganizationInvite[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600))
  return [...mockInvites]
}

export async function mockCancelInvite(inviteId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500))
  mockInvites = mockInvites.filter(inv => inv.invite_id !== inviteId)
}

export async function mockResendInvite(inviteId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500))
  const invite = mockInvites.find(inv => inv.invite_id === inviteId)
  if (!invite) throw new Error("Invite not found")
  // In reality this would trigger an email
}

export async function mockUpdateMemberRole(userId: string, newRole: OrganizationRole): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500))
  // Just simulate success
}

export function addMockInvite(invite: OrganizationInvite) {
  mockInvites.push(invite)
}
