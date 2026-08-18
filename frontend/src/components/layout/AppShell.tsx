"use client"

import {
  useEffect,
} from "react"

import type { ReactNode } from "react"

import {
  Loader2,
} from "lucide-react"

import {
  usePathname,
  useRouter,
} from "next/navigation"

import {
  useAuth,
} from "@/components/auth/AuthProvider"

import {
  Header,
} from "@/components/layout/Header"

import {
  Sidebar,
} from "@/components/layout/Sidebar"


const PUBLIC_ROUTES = [
  "/login",
  "/register",
]


export function AppShell({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const {
    isAuthenticated,
    isLoading,
  } = useAuth()

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname)


  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      !isPublicRoute
    ) {
      router.replace("/login")
    }
  }, [
    isAuthenticated,
    isLoading,
    isPublicRoute,
    router,
  ])


  if (isPublicRoute) {
    return (
      <main className="min-h-screen bg-background">
        {children}
      </main>
    )
  }


  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-sm">
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }


  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}