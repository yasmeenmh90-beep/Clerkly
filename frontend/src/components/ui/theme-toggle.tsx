"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-8 w-14 rounded-full bg-muted border border-border" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`pointer-events-none absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border/50 transition-transform duration-300 ${
          theme === "dark" ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="h-3.5 w-3.5 text-foreground" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-foreground" />
        )}
      </span>
    </button>
  )
}
