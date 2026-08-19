"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { 
  ArrowRight, FileText, CheckCircle2, Shield, Brain, Sparkles, 
  Clock, Lock, Zap, FileCheck2, Activity, ChevronRight, Check, CheckSquare, LayoutDashboard
} from "lucide-react"
import { useState, useEffect } from "react"

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function LandingPage() {
  const { scrollY } = useScroll()
  const isScrolled = useTransform(scrollY, [0, 50], [0, 1])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden text-foreground">
      
      {/* NAVBAR */}
      <motion.nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3' : 'bg-transparent py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Clerkly</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">
              Sign In
            </Link>
            <Link href="/register">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      <main className="pt-32 pb-20">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center text-center mt-10 md:mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-powered paperwork assistant</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl"
          >
            Paperwork, handled.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.3 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            Clerkly uses AI to understand your paperwork, find what needs attention, and turn it into actionable work.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/register">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-base font-semibold shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2 group"
              >
                Get Started 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <a href="#how-it-works">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-muted text-foreground px-8 py-3.5 rounded-xl text-base font-semibold border border-border/50 hover:bg-muted/80 transition-colors"
              >
                See How It Works
              </motion.button>
            </a>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-6 text-xs text-muted-foreground font-medium"
          >
            Your paperwork. Understood, organized, and ready for action.
          </motion.p>
        </section>

        {/* HERO VISUAL */}
        <section className="max-w-5xl mx-auto px-6 mt-24 mb-32 relative">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.5 }}
            className="relative rounded-2xl border border-border/60 bg-card/50 shadow-2xl overflow-hidden backdrop-blur-xl aspect-[16/9] md:aspect-[2/1] flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-3xl">
              {/* Document Mock */}
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full md:w-1/2 bg-background border border-border shadow-lg rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_3s_infinite]" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Insurance Renewal.pdf</div>
                    <div className="text-xs text-primary flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Analyzing document...
                    </div>
                  </div>
                </div>
                <div className="space-y-3 opacity-40">
                  <div className="h-2 bg-border rounded w-full" />
                  <div className="h-2 bg-border rounded w-5/6" />
                  <div className="h-2 bg-border rounded w-4/6" />
                  <div className="h-2 bg-border rounded w-full mt-6" />
                  <div className="h-2 bg-border rounded w-3/4" />
                </div>
              </motion.div>

              {/* Extraction Mock */}
              <div className="w-full md:w-1/2 flex flex-col gap-4 relative z-10">
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.5, ...spring }}
                  className="bg-background border border-border shadow-md rounded-xl p-4 flex items-start gap-4"
                >
                  <div className="p-2 bg-warning/10 text-warning rounded-lg shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Renewal Deadline</div>
                    <div className="font-semibold mt-0.5">September 30, 2026</div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 2.0, ...spring }}
                  className="bg-background border border-border shadow-md rounded-xl p-4 flex items-start gap-4"
                >
                  <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Action Detected</div>
                    <div className="font-semibold mt-0.5">Renew insurance policy</div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2.8, ...spring }}
                  className="bg-success text-success-foreground shadow-lg rounded-xl p-3 flex items-center justify-center gap-2 font-medium text-sm mx-auto mt-2 px-6"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Task Created & Ready for Approval
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-y border-border/50 bg-muted/30 py-8 mb-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-center md:text-left">
              From paperwork to action — without the busywork
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Brain className="w-4 h-4 text-primary" /> AI-powered
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="w-4 h-4 text-primary" /> Secure
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Human-approved
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Activity className="w-4 h-4 text-primary" /> Action-oriented
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">From paperwork to done.</h2>
            <p className="text-muted-foreground text-lg">A simple workflow that keeps you in control.</p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border/50 -translate-y-1/2 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Upload", desc: "Give Clerkly the document." },
                { step: "02", title: "Understand", desc: "Clerkly extracts important information, deadlines, and required actions." },
                { step: "03", title: "Review", desc: "Review and approve important actions before they happen." },
                { step: "04", title: "Complete", desc: "Clerkly keeps the work moving and records what happened." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ ...spring, delay: i * 0.15 }}
                  className="relative z-10 bg-background border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl font-black text-muted/50 mb-4">{item.step}</div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CLERKLY THINKS FOR YOU */}
        <section className="bg-muted/20 py-24 border-y border-border/50 mb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">AI that thinks for you.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We designed Clerkly to do the heavy lifting of reading and planning, 
                so you can focus purely on execution and approval. It's like having a chief of staff for your documents.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
              className="bg-card border border-border/60 rounded-2xl p-8 shadow-xl"
            >
              <h3 className="font-semibold text-primary mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5" /> Clerkly found 3 things
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                  <Check className="w-5 h-5 text-success" />
                  <span className="font-medium text-sm">Renewal deadline</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                  <Check className="w-5 h-5 text-success" />
                  <span className="font-medium text-sm">Required signature</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                  <Check className="w-5 h-5 text-success" />
                  <span className="font-medium text-sm">Follow-up action</span>
                </div>
              </div>
              <div className="pt-6 border-t border-border flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-lg">3 tasks created</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PRODUCT FEATURES */}
        <section id="features" className="max-w-7xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to manage paperwork.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "AI Document Understanding", desc: "Turn unstructured paperwork into clear information and next steps.", icon: Brain },
              { title: "Smart Tasks", desc: "Automatically turn paperwork into actionable tasks.", icon: CheckSquare },
              { title: "Deadline Detection", desc: "Know what needs attention before important dates pass.", icon: Clock },
              { title: "Human Approval", desc: "Keep control over important actions with approval workflows.", icon: FileCheck2 },
              { title: "Activity History", desc: "See exactly what happened and when.", icon: Activity },
              { title: "Centralized Workspace", desc: "Keep documents, tasks, approvals, and activity together.", icon: LayoutDashboard }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HUMAN IN THE LOOP */}
        <section className="max-w-4xl mx-auto px-6 mb-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">AI moves the work forward.<br/>You stay in control.</h2>
          <p className="text-lg text-muted-foreground mb-12">
            Clerkly can identify actions and prepare work, but important decisions remain with you.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border p-8 rounded-2xl shadow-sm">
            <div className="text-sm font-medium">AI detects</div>
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="text-sm font-medium">AI prepares</div>
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="text-sm font-medium text-primary">You review</div>
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="text-sm font-medium text-primary">Approve / Reject</div>
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="text-sm font-medium">Action completed</div>
          </div>
        </section>

        {/* SECURITY */}
        <section id="security" className="bg-foreground text-background py-24 mb-32">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Built for paperwork you can trust.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="font-semibold mb-2">Secure authentication</div>
                <p className="text-sm opacity-70">Your access is heavily guarded.</p>
              </div>
              <div>
                <div className="font-semibold mb-2">Controlled actions</div>
                <p className="text-sm opacity-70">Nothing happens without you.</p>
              </div>
              <div>
                <div className="font-semibold mb-2">Activity history</div>
                <p className="text-sm opacity-70">Complete audit trails of all work.</p>
              </div>
              <div>
                <div className="font-semibold mb-2">Human approval</div>
                <p className="text-sm opacity-70">You always have the final say.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={spring}
            className="bg-card border border-border p-12 rounded-3xl shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">Stop managing paperwork.<br/>Start getting it done.</h2>
            <p className="text-lg text-muted-foreground mb-10 relative z-10">Let Clerkly understand the paperwork and keep the work moving.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link href="/register">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-base font-semibold shadow-md hover:bg-primary/90 transition-colors w-full sm:w-auto"
                >
                  Get Started
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-background text-foreground px-8 py-3.5 rounded-xl text-base font-semibold border border-border hover:bg-muted transition-colors w-full sm:w-auto"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/30 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">Clerkly</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              AI-powered paperwork assistant. Turn unstructured documents into clear information and actionable next steps.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
              <li><a href="#security" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Account</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Get Started</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-border/50 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} Clerkly Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
