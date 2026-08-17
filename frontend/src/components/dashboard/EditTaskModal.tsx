"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, CheckCircle2 } from "lucide-react"
import { TaskStatus, TaskPriority } from "@/types"

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: any
}

export function EditTaskModal({ isOpen, onClose, onSuccess, initialData }: EditTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: (initialData?.priority || "medium") as TaskPriority,
    deadline: initialData?.deadline ? initialData.deadline.split('T')[0] : "",
    document_type: initialData?.document_type || "",
    requires_signature: initialData?.requires_signature || false,
    requires_payment: initialData?.requires_payment || false,
    amount: initialData?.amount || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate network request to create task
    await new Promise(r => setTimeout(r, 1000))
    
    setIsSubmitting(false)
    setShowSuccess(true)
    
    setTimeout(() => {
      setShowSuccess(false)
      onSuccess() // this will close modal and optionally refresh tasks
    }, 1500)
  }

  if (!isOpen && !showSuccess) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {showSuccess ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Task Updated!</h3>
              <p className="text-muted-foreground text-sm">Your task has been updated successfully.</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
                <h3 className="text-lg font-bold text-foreground">Edit Task</h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-muted text-muted-foreground rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="new-task-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Task Title <span className="text-danger">*</span></label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Q3 Tax Return"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea 
                      placeholder="Add details about this task..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-all text-foreground resize-none h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Priority</label>
                      <select 
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Deadline <span className="text-danger">*</span></label>
                      <input 
                        required 
                        type="date"
                        value={formData.deadline}
                        onChange={e => setFormData({...formData, deadline: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Document Type</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Tax Form, Contract"
                      value={formData.document_type}
                      onChange={e => setFormData({...formData, document_type: e.target.value})}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                    />
                  </div>

                  <div className="pt-2 pb-2 space-y-4 border-t border-border mt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border bg-background group-hover:border-primary transition-colors">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={formData.requires_signature}
                          onChange={e => setFormData({...formData, requires_signature: e.target.checked})}
                        />
                        <div className="w-full h-full bg-primary rounded hidden peer-checked:flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      </div>
                      <span className="text-sm text-foreground select-none">Requires e-signature</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border bg-background group-hover:border-primary transition-colors">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={formData.requires_payment}
                          onChange={e => setFormData({...formData, requires_payment: e.target.checked})}
                        />
                        <div className="w-full h-full bg-primary rounded hidden peer-checked:flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      </div>
                      <span className="text-sm text-foreground select-none">Requires payment</span>
                    </label>
                    
                    {formData.requires_payment && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pl-8"
                      >
                        <div className="relative w-1/2">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                          <input 
                            type="number"
                            placeholder="0.00"
                            required={formData.requires_payment}
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                            className="w-full h-10 pl-8 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-border bg-muted/10 shrink-0 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="new-task-form"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
