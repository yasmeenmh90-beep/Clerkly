"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import type { ReactNode } from "react"
import type { User } from "@/types"
import type { Organization } from "@/lib/api"

import {
  clearAccessToken,
  getCurrentOrganizationId,
  getCurrentUser,
  getOrganizations,
  getPolicyStatus,
  isAuthenticated as hasAccessToken,
  logout,
  setCurrentOrganizationId,
} from "@/lib/api"


interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
  logoutUser: () => void

  organizations: Organization[]
  currentOrganization: Organization | null
  isLoadingOrganizations: boolean
  switchOrganization: (organizationId: string) => void
  refreshOrganizations: () => Promise<void>

  // Policy acceptance state
  policyAccepted: boolean
  isPolicyLoading: boolean
  policyError: string | null
  recheckPolicy: () => Promise<void>
  onPolicyAccepted: () => void
}


const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  )


export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] =
    useState<User | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [organizations, setOrganizations] =
    useState<Organization[]>([])

  const [
    currentOrganizationId,
    setCurrentOrganizationIdState,
  ] = useState<string | null>(null)

  const [
    isLoadingOrganizations,
    setIsLoadingOrganizations,
  ] = useState(true)

  // Policy state — defaults to false so the user is
  // never silently allowed through if the check fails.
  const [policyAccepted, setPolicyAccepted] =
    useState(false)

  const [isPolicyLoading, setIsPolicyLoading] =
    useState(false)

  const [policyError, setPolicyError] =
    useState<string | null>(null)


  // ── Policy status check ──────────────────────────
  // Fetches GET /policy/status for the current user.
  // Called once after authentication is established.
  const recheckPolicy =
    useCallback(async (): Promise<void> => {
      if (!hasAccessToken()) {
        setPolicyAccepted(false)
        setIsPolicyLoading(false)
        setPolicyError(null)
        return
      }

      try {
        setIsPolicyLoading(true)
        setPolicyError(null)

        const status = await getPolicyStatus()

        setPolicyAccepted(status.accepted === true)
      } catch {
        // Do NOT default to accepted on failure.
        setPolicyAccepted(false)
        setPolicyError(
          "Unable to verify your policy acceptance status. Please try again.",
        )
      } finally {
        setIsPolicyLoading(false)
      }
    }, [])


  // Allows the PolicyAgreementModal to update local
  // state immediately after a successful POST, without
  // requiring a full page reload or re-fetch.
  const onPolicyAccepted = useCallback((): void => {
    setPolicyAccepted(true)
    setPolicyError(null)
  }, [])


  const refreshOrganizations =
    useCallback(async (): Promise<void> => {
      if (!hasAccessToken()) {
        setOrganizations([])
        setCurrentOrganizationIdState(null)
        setIsLoadingOrganizations(false)
        return
      }

      try {
        setIsLoadingOrganizations(true)

        const orgs = await getOrganizations()

        setOrganizations(orgs)

        // Keep whichever org was already selected if it's
        // still in the list (e.g. after a page refresh).
        // Otherwise default to the first one — in practice,
        // a user's own personal workspace, since that's
        // always their earliest membership.
        const storedId = getCurrentOrganizationId()

        const stillValid = orgs.some(
          (org) => org.organization_id === storedId,
        )

        const nextId =
          storedId && stillValid
            ? storedId
            : (orgs[0]?.organization_id ?? null)

        if (nextId) {
          setCurrentOrganizationId(nextId)
          setCurrentOrganizationIdState(nextId)
        }
      } catch {
        setOrganizations([])
        setCurrentOrganizationIdState(null)
      } finally {
        setIsLoadingOrganizations(false)
      }
    }, [])


  const switchOrganization = useCallback(
    (organizationId: string): void => {
      setCurrentOrganizationId(organizationId)
      setCurrentOrganizationIdState(organizationId)
    },
    [],
  )


  const refreshUser =
    useCallback(async (): Promise<void> => {
      if (!hasAccessToken()) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        const currentUser =
          await getCurrentUser()

        setUser(currentUser)

        // Fetch organizations and policy status in
        // parallel once the user is authenticated.
        await Promise.all([
          refreshOrganizations(),
          recheckPolicy(),
        ])
      } catch {
        clearAccessToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }, [refreshOrganizations, recheckPolicy])


  useEffect(() => {
    void refreshUser()
    // Only run on mount — refreshUser itself pulls in
    // refreshOrganizations, which would otherwise cause this
    // to re-run every time organizations change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const logoutUser = useCallback((): void => {
    logout()
    setUser(null)
    setOrganizations([])
    setCurrentOrganizationIdState(null)
    setPolicyAccepted(false)
    setPolicyError(null)
  }, [])


  const currentOrganization = useMemo(
    () =>
      organizations.find(
        (org) =>
          org.organization_id === currentOrganizationId,
      ) ?? null,
    [organizations, currentOrganizationId],
  )


  const contextValue =
    useMemo<AuthContextValue>(
      () => ({
        user,
        isLoading,
        isAuthenticated: user !== null,
        refreshUser,
        logoutUser,
        organizations,
        currentOrganization,
        isLoadingOrganizations,
        switchOrganization,
        refreshOrganizations,
        policyAccepted,
        isPolicyLoading,
        policyError,
        recheckPolicy,
        onPolicyAccepted,
      }),
      [
        user,
        isLoading,
        refreshUser,
        logoutUser,
        organizations,
        currentOrganization,
        isLoadingOrganizations,
        switchOrganization,
        refreshOrganizations,
        policyAccepted,
        isPolicyLoading,
        policyError,
        recheckPolicy,
        onPolicyAccepted,
      ],
    )


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    )
  }

  return context
}