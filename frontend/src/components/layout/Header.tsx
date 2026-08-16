"use client"

import { Search, Bell, Clock, Loader2 } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getNotifications } from "@/lib/api"
import { Notification } from "@/types"

export function Header() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  
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

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const data = await getNotifications()
        setNotifications(data)
      } catch (err) {
        console.error("Failed to load notifications", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n))
  }

  return (
    <header className="h-16 px-4 md:px-6 lg:px-8 border-b border-border bg-card flex items-center justify-between shrink-0 pl-16 md:pl-8 relative z-40">
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

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-danger border-2 border-card"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                  <div>
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    <p className="text-xs text-muted-foreground">You have {unreadCount} unread messages</p>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto relative min-h-24">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/50">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No notifications yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map(notif => (
                        <div 
                          key={notif.notification_id}
                          onClick={() => markAsRead(notif.notification_id)}
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 ${!notif.is_read ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <p className={`text-sm font-medium ${!notif.is_read ? 'text-foreground' : 'text-foreground/80'}`}>{notif.title}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {notif.timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{notif.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border bg-muted/10 text-center">
                  <button className="text-xs font-medium text-foreground hover:text-primary transition-colors">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
