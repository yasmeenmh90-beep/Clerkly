"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Save, Upload, Loader2, CheckCircle2, X } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [profile, setProfile] = useState({
    name: "Alex Jensen",
    email: "alex@clerkly.ai",
    company: "Acme Corp",
    role: "Administrator",
    bio: "Senior Operations Manager overseeing document automation and approvals."
  })

  // For cancel functionality
  const [tempProfile, setTempProfile] = useState({...profile})

  const handleEdit = () => {
    setTempProfile({...profile})
    setIsEditing(true)
  }

  const handleCancel = () => {
    setTempProfile({...profile})
    setIsEditing(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setProfile({...tempProfile})
    setIsSaving(false)
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and identity.</p>
        </div>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-success text-sm font-medium bg-success/10 px-4 py-2 rounded-full border border-success/20">
            <CheckCircle2 className="w-4 h-4" /> Profile updated
          </motion.div>
        )}
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave}>
          <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold border-4 border-background shadow-md">
                {(isEditing ? tempProfile.name : profile.name).split(' ').map(n => n[0]).join('')}
              </div>
              {isEditing && (
                <button type="button" className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95">
                  <Upload className="w-4 h-4" /> Change Picture
                </button>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-6">
              <div className="flex justify-between items-center border-b border-border/50 pb-4">
                <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
                {!isEditing && (
                  <button type="button" onClick={handleEdit} className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium rounded-lg transition-colors active:scale-95">
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  {isEditing ? (
                    <input type="text" required value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground" />
                  ) : (
                    <p className="text-foreground h-10 flex items-center">{profile.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  {isEditing ? (
                    <input type="email" required value={tempProfile.email} onChange={e => setTempProfile({...tempProfile, email: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground" />
                  ) : (
                    <p className="text-foreground h-10 flex items-center">{profile.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company</label>
                  {isEditing ? (
                    <input type="text" value={tempProfile.company} onChange={e => setTempProfile({...tempProfile, company: e.target.value})} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground" />
                  ) : (
                    <p className="text-foreground h-10 flex items-center">{profile.company}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <p className="text-muted-foreground h-10 flex items-center bg-muted/30 px-3 rounded-md">{profile.role}</p>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                {isEditing ? (
                  <textarea rows={3} value={tempProfile.bio} onChange={e => setTempProfile({...tempProfile, bio: e.target.value})} className="w-full p-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground resize-none" />
                ) : (
                  <p className="text-foreground bg-muted/10 p-3 rounded-md border border-transparent">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {isEditing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-border pt-6 flex justify-end gap-3">
                <button type="button" onClick={handleCancel} disabled={isSaving} className="px-5 py-2.5 border border-border bg-card hover:bg-muted text-foreground font-medium rounded-lg transition-colors active:scale-95 disabled:opacity-70 flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm transition-colors active:scale-95 flex items-center gap-2 disabled:opacity-70">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}
