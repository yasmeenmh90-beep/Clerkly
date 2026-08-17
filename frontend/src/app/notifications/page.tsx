"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, CheckCircle2, AlertCircle, Info, Clock, Trash2, Check, Loader2 } from "lucide-react"
import { getNotifications } from "@/lib/api"
import { Notification } from "@/types"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  
  useEffect(() => {
    const fetchNotifs = async () => {
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
    fetchNotifs()
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n))
  }

  const clearNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.notification_id !== id))
  }

  const getIcon = (type: string) => {
    switch(type) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-success" />
      case "warning": return <AlertCircle className="w-5 h-5 text-warning" />
      case "error": return <AlertCircle className="w-5 h-5 text-danger" />
      default: return <Info className="w-5 h-5 text-primary" />
    }
  }

  const filteredNotifs = filter === "all" ? notifications : notifications.filter(n => !n.is_read)

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your tasks, approvals, and documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card border border-border rounded-lg p-1 flex">
            <button 
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === "unread" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Unread
            </button>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllRead}
              className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">You are all caught up on your alerts.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            <AnimatePresence initial={false}>
              {filteredNotifs.map((notif) => (
                <motion.div
                  key={notif.notification_id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={() => markAsRead(notif.notification_id)}
                  className={`group p-4 sm:p-6 hover:bg-muted/30 transition-all duration-200 cursor-pointer flex gap-4 ${!notif.is_read ? 'bg-primary/5' : ''}`}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-base font-medium truncate pr-4 ${!notif.is_read ? 'text-foreground' : 'text-foreground/80'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => clearNotification(e, notif.notification_id)}
                      className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
