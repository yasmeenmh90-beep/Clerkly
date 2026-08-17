"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ArrowRight, Loader2, FileCheck2, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate auth network request
    await new Promise(r => setTimeout(r, 1200))
    setIsLoading(false)
    setIsSent(true)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border/60 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-8 pb-6 text-center border-b border-border/50 bg-muted/20">
          <div className="w-14 h-14 mx-auto bg-primary rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <FileCheck2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="p-8 pt-6">
          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@clerkly.ai"
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-11 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center py-4 space-y-6"
              >
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Check your inbox</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We've sent a password reset link to <br/><span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
                <button 
                  onClick={() => window.location.href = "/login"}
                  className="w-full h-11 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {!isSent && (
          <div className="p-4 border-t border-border/50 bg-muted/20 text-center">
            <Link 
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
