"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Approval } from "@/types"
import { Check, X, FileText, IndianRupee, PenTool, AlertCircle, Loader2 } from "lucide-react"
import { getApprovals, approveRequest, rejectRequest } from "@/lib/api"

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getApprovals()
        setApprovals(data)
      } catch (err) {
        setError("Unable to load approvals. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchApprovals()
  }, [])

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = async (approvalId: string) => {
    try {
      setProcessingId(approvalId)
      await approveRequest(approvalId)
      setApprovals(prev => prev.filter(a => a.approval_id !== approvalId))
      showToast("Request approved successfully", "success")
    } catch (err) {
      showToast("Failed to approve request", "error")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (approvalId: string) => {
    try {
      setProcessingId(approvalId)
      await rejectRequest(approvalId)
      setApprovals(prev => prev.filter(a => a.approval_id !== approvalId))
      showToast("Request rejected", "error")
    } catch (err) {
      showToast("Failed to reject request", "error")
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p>Loading approvals...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-danger space-y-4">
        <AlertCircle className="w-10 h-10" />
        <p className="font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 mt-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80">Try Again</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8 relative">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">Pending Approvals</h2>
        <p className="text-sm text-muted-foreground">Review and take action on the following requests.</p>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {approvals.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-16 text-center text-muted-foreground bg-card border border-border rounded-xl"
            >
              <Check className="w-12 h-12 mx-auto mb-4 text-success opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-1">All caught up!</h3>
              <p>You have no pending approvals at this time.</p>
            </motion.div>
          )}

          {approvals.map((item, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              key={item.approval_id}
              className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl border ${item.type === "payment" ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                  {item.type === "payment" ? <IndianRupee className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base mb-1">{item.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {item.document_type}</span>
                    <span>•</span>
                    <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {item.type === "payment" && item.amount && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border/50 text-sm font-medium text-foreground">
                      Amount: <span className="text-warning">₹{item.amount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto relative">
                {processingId === item.approval_id && (
                  <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
                <button
                  onClick={() => handleReject(item.approval_id)}
                  disabled={processingId === item.approval_id}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(item.approval_id)}
                  disabled={processingId === item.approval_id}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
              toast.type === 'success' 
                ? 'bg-success/10 border-success/20 text-success-foreground' 
                : 'bg-danger/10 border-danger/20 text-danger-foreground'
            } backdrop-blur-md`}
          >
            {toast.type === 'success' ? <Check className="w-5 h-5 text-success" /> : <AlertCircle className="w-5 h-5 text-danger" />}
            <span className="font-medium text-sm text-foreground">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
