"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  Bell,
  Clock,
  Loader2,
  Search,
} from "lucide-react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  useAuth,
} from "@/components/auth/AuthProvider"

import {
  getNotifications,
} from "@/lib/api"

import type {
  Notification,
} from "@/types"


function getPageDetails(pathname: string): {
  title: string
  subtitle: string
} {
  if (pathname === "/dashboard" || pathname === "/") {
    return {
      title: "Dashboard",
      subtitle: "Overview and activity",
    }
  }

  if (pathname === "/tasks/new") {
    return {
      title: "Create Task",
      subtitle: "Add a new manual task",
    }
  }

  if (pathname === "/tasks") {
    return {
      title: "Tasks",
      subtitle: "Manage your pending work",
    }
  }

  if (pathname === "/approvals") {
    return {
      title: "Approvals",
      subtitle: "Review and approve requests",
    }
  }

  if (pathname === "/documents") {
    return {
      title: "Documents",
      subtitle: "Upload documents for analysis",
    }
  }

  if (pathname === "/activity") {
    return {
      title: "Activity",
      subtitle: "Recent system events",
    }
  }

  if (pathname === "/notifications") {
    return {
      title: "Notifications",
      subtitle: "Recent Clerkly updates",
    }
  }

  if (pathname === "/profile") {
    return {
      title: "Profile",
      subtitle: "Your account information",
    }
  }

  if (pathname === "/settings") {
    return {
      title: "Settings",
      subtitle: "Account and appearance",
    }
  }

  return {
    title: "Clerkly",
    subtitle: "Manage your paperwork",
  }
}


export function Header() {
  const pathname = usePathname()
  const {
    user,
  } = useAuth()

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false)

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(false)

  const notificationRef =
    useRef<HTMLDivElement>(null)

  const {
    title,
    subtitle,
  } = getPageDetails(pathname)

  const displayName =
    user?.full_name?.trim() ||
    user?.email.split("@")[0] ||
    "User"

  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()


  useEffect(() => {
    async function fetchNotifications(): Promise<void> {
      try {
        setIsLoading(true)

        const data = await getNotifications()

        setNotifications(data)
      } catch (error) {
        console.error(
          "Failed to load recent updates",
          error,
        )
      } finally {
        setIsLoading(false)
      }
    }

    void fetchNotifications()
  }, [])


  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ): void {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node,
        )
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      )
    }
  }, [])


  function handleSearch(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const parameters =
      new URLSearchParams(window.location.search)

    const query = event.target.value.trim()

    if (query) {
      parameters.set("q", query)
    } else {
      parameters.delete("q")
    }

    const queryString = parameters.toString()

    window.history.replaceState(
      {},
      "",
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
    )

    window.dispatchEvent(
      new Event("search-updated"),
    )
  }


  return (
    <header className="relative z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 pl-16 md:px-6 md:pl-8 lg:px-8">
      <div>
        <h1 className="hidden text-xl font-semibold text-foreground sm:block">
          {title}
        </h1>

        <p className="hidden text-xs text-muted-foreground sm:block md:text-sm">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="relative hidden w-full max-w-sm md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="search"
            aria-label="Search Clerkly"
            placeholder="Search tasks and activity..."
            onChange={handleSearch}
            className="h-9 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>

        <div
          className="relative"
          ref={notificationRef}
        >
          <button
            type="button"
            aria-label="Show recent updates"
            aria-expanded={showNotifications}
            onClick={() =>
              setShowNotifications(
                (currentValue) => !currentValue,
              )
            }
            className={`rounded-full p-2 transition-colors ${
              showNotifications
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Bell className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:w-96"
              >
                <div className="border-b border-border bg-muted/30 p-4">
                  <h3 className="font-semibold text-foreground">
                    Recent Updates
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Latest events from your Clerkly tasks
                  </p>
                </div>

                <div className="relative max-h-96 min-h-24 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex min-h-24 items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center p-10 text-center text-muted-foreground">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                        <Bell className="h-6 w-6 opacity-40" />
                      </div>

                      <h4 className="mb-1 text-sm font-medium text-foreground">
                        No recent updates
                      </h4>

                      <p className="max-w-[200px] text-xs">
                        Task and document events will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map(
                        (notification) => (
                          <div
                            key={
                              notification.notification_id
                            }
                            className="flex gap-3 p-4"
                          >
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />

                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">
                                  {notification.title}
                                </p>

                                <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />

                                  {notification.timestamp}
                                </span>
                              </div>

                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {notification.description}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-border bg-muted/10 p-3 text-center">
                  <Link
                    href="/notifications"
                    onClick={() =>
                      setShowNotifications(false)
                    }
                    className="text-xs font-medium text-foreground transition-colors hover:text-primary"
                  >
                    View all recent updates
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative ml-2 hidden sm:block">
          <Link
            href="/profile"
            aria-label={`Open ${displayName}'s profile`}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-primary/10 text-sm font-bold text-primary transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  )
}