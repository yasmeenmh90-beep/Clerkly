"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronsUpDown, Building2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { cn } from "@/lib/utils"

export function OrganizationSwitcher() {
  const { currentOrganization, organizations, switchOrganization, isLoadingOrganizations } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (isLoadingOrganizations) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 animate-pulse bg-muted/50 rounded-lg w-full h-[58px]">
        <div className="w-5 h-5 bg-muted-foreground/20 rounded-md" />
        <div className="h-4 bg-muted-foreground/20 rounded w-24" />
      </div>
    )
  }

  if (!organizations || organizations.length === 0) {
    return null
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-col items-start truncate">
            <span className="truncate leading-none">
              {currentOrganization?.name || "Select Organization"}
            </span>
            {currentOrganization?.role && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                {currentOrganization.role}
              </span>
            )}
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95">
          <div className="max-h-60 overflow-y-auto p-1" role="listbox">
            {organizations.map((org) => (
              <button
                key={org.organization_id}
                role="option"
                aria-selected={currentOrganization?.organization_id === org.organization_id}
                onClick={() => {
                  switchOrganization(org.organization_id)
                  setIsOpen(false)
                  // Minimal fix to ensure data reloads correctly across pages since TasksPage
                  // uses an empty dependency array in its useEffect for loadTasks.
                  window.location.reload()
                }}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  currentOrganization?.organization_id === org.organization_id && "bg-accent/50"
                )}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {currentOrganization?.organization_id === org.organization_id && (
                    <Check className="h-4 w-4" />
                  )}
                </span>
                <div className="flex flex-col items-start truncate">
                  <span className="truncate font-medium">{org.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{org.role}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
