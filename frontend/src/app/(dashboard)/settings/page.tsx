"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Bell, Monitor, Settings as SettingsIcon, Save, Upload, Loader2, CheckCircle2 } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Mock State
  const [profile, setProfile] = useState({
    name: "Alex Jensen",
    email: "alex@clerkly.ai",
    company: "Acme Corp",
    role: "Administrator"
  })

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReport: true,
    autoAssign: false,
    compactMode: false
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800))
    setIsSaving(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "appearance", label: "Appearance", icon: Monitor },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "general", label: "General", icon: SettingsIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSave}>
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                  <p className="text-sm text-muted-foreground">Update your personal details.</p>
                </div>
                
                <div className="flex items-center gap-6 pb-4 border-b border-border/50">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <button type="button" className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Upload className="w-4 h-4" /> Change Avatar
                    </button>
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email}
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Company</label>
                    <input 
                      type="text" 
                      value={profile.company}
                      onChange={e => setProfile({...profile, company: e.target.value})}
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Role</label>
                    <input 
                      type="text" 
                      value={profile.role}
                      disabled
                      className="w-full h-10 px-3 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                  <p className="text-sm text-muted-foreground">Customize how Clerkly looks on your device.</p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Compact Mode</h3>
                      <p className="text-sm text-muted-foreground">Reduce spacing in lists and tables</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={preferences.compactMode} onChange={() => setPreferences({...preferences, compactMode: !preferences.compactMode})} />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">Theme toggle is available in the sidebar.</p>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
                  <p className="text-sm text-muted-foreground">Choose what updates you want to receive.</p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <h3 className="font-medium text-foreground">Email Alerts</h3>
                      <p className="text-sm text-muted-foreground">Receive daily summaries via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={preferences.emailAlerts} onChange={() => setPreferences({...preferences, emailAlerts: !preferences.emailAlerts})} />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="p-4 rounded-lg border border-border flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <h3 className="font-medium text-foreground">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">Get instant alerts in your browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={preferences.pushNotifications} onChange={() => setPreferences({...preferences, pushNotifications: !preferences.pushNotifications})} />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="p-4 rounded-lg border border-border flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <h3 className="font-medium text-foreground">Weekly Report</h3>
                      <p className="text-sm text-muted-foreground">Receive a weekly activity digest</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={preferences.weeklyReport} onChange={() => setPreferences({...preferences, weeklyReport: !preferences.weeklyReport})} />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "general" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage system-wide preferences.</p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <h3 className="font-medium text-foreground">Auto-assign Tasks</h3>
                      <p className="text-sm text-muted-foreground">Automatically assign tasks based on AI rules</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={preferences.autoAssign} onChange={() => setPreferences({...preferences, autoAssign: !preferences.autoAssign})} />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-end gap-4">
              <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-success text-sm font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Saved successfully
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
