"use client"

import { Search, Bell } from "lucide-react"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === '/dashboard' || pathname === '/') return { title: "Dashboard", subtitle: "Overview and activity" };
    if (pathname === '/tasks') return { title: "Tasks", subtitle: "Manage your pending work" };
    if (pathname === '/approvals') return { title: "Approvals", subtitle: "Review and approve requests" };
    if (pathname === '/documents') return { title: "Documents", subtitle: "Your file repository" };
    if (pathname === '/activity') return { title: "Activity", subtitle: "Recent system events" };
    if (pathname === '/settings') return { title: "Settings", subtitle: "Manage your preferences" };
    return { title: "Paperwork AI", subtitle: "Manage your paperwork" };
  }
  
  const { title, subtitle } = getPageTitle();

  return (
    <header className="h-16 px-4 md:px-6 lg:px-8 border-b border-border bg-card flex items-center justify-between shrink-0 pl-16 md:pl-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground hidden sm:block">{title}</h1>
        <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className="relative w-full max-w-sm hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search tasks, documents..." 
            className="w-full h-9 pl-10 pr-4 rounded-full bg-background border border-border text-sm focus:outline-none focus:border-primary transition-all text-foreground"
          />
        </div>
        
        <button className="md:hidden p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
          <Search className="h-5 w-5" />
        </button>

        <button className="relative p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-card"></span>
        </button>
      </div>
    </header>
  )
}
