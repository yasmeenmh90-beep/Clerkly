"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, FileText, Activity, Settings, Menu, X, FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ThemeToggle } from "../ui/theme-toggle";

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { OrganizationSwitcher } from "@/components/organization/OrganizationSwitcher"
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Approvals", href: "/approvals", icon: FileCheck2 },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter()

const {
  user,
  logoutUser,
} = useAuth()

const displayName =
  user?.full_name?.trim() ||
  user?.email.split("@")[0] ||
  "User"

const initials = displayName
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join("")

function handleLogout(): void {
  logoutUser()
  router.replace("/login")
}
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-card border border-border/60 text-foreground shadow-sm transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
  Clerkly
</span>
          </div>
        </div>
        
        <div className="px-4 py-3 border-b border-border/50">
          <OrganizationSwitcher />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          
          <div className="flex items-center gap-3 rounded-lg p-2">
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20">
    <span className="text-sm font-bold text-primary">
      {initials || "U"}
    </span>
  </div>

  <div className="flex min-w-0 flex-1 flex-col">
    <span className="truncate text-sm font-medium text-foreground">
      {displayName}
    </span>

    <span className="truncate text-xs text-muted-foreground">
      {user?.email}
    </span>
  </div>

  <button
    type="button"
    onClick={handleLogout}
    title="Sign out"
    aria-label="Sign out"
    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
  >
    <LogOut className="h-4 w-4" />
  </button>
</div>
        </div>
      </aside>
    </>
  );
}
