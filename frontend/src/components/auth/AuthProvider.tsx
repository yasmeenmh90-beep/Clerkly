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

import {
  clearAccessToken,
  getCurrentUser,
  isAuthenticated as hasAccessToken,
  logout,
} from "@/lib/api"


interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
  logoutUser: () => void
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
      } catch {
        clearAccessToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }, [])


  useEffect(() => {
    void refreshUser()
  }, [refreshUser])


  const logoutUser = useCallback((): void => {
    logout()
    setUser(null)
  }, [])


  const contextValue =
    useMemo<AuthContextValue>(
      () => ({
        user,
        isLoading,
        isAuthenticated: user !== null,
        refreshUser,
        logoutUser,
      }),
      [
        user,
        isLoading,
        refreshUser,
        logoutUser,
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