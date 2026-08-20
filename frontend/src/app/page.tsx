"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  ArrowRight, FileText, CheckCircle2, Shield, Brain, Sparkles,
  Clock, Lock, Zap, FileCheck2, Activity, Check, CheckSquare,
  LayoutDashboard, Menu, X, Eye, Upload, Fingerprint
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

const Hero3D = dynamic(() => import('@/components/landing/Hero3D'), { ssr: false })

const spring: any = { type: "spring", stiffness: 260, damping: 20 }
const gentleSpring: any = { type: "spring", stiffness: 100, damping: 18 }

/* ── Scroll-reveal wrapper ─────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  // Parallax for aurora blobs
  const auroraY1 = useTransform(scrollY, [0, 1000], [0, -120])
  const auroraY2 = useTransform(scrollY, [0, 1000], [0, -80])
  const auroraY3 = useTransform(scrollY, [0, 1000], [0, -50])

  // Parallax for hero visualization
  const vizY = useTransform(scrollY, [0, 600], [0, 60])
  const vizScale = useTransform(scrollY, [0, 400], [1, 0.97])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden text-foreground relative">

      {/* ══════════════════════════════════════════════════════
          AURORA BACKGROUND — large blurred gradient blobs
         ══════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Primary blue blob — top right */}
        <motion.div
          style={{ y: auroraY1 }}
          className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full aurora-blob-1"
        />
        {/* Cyan/teal blob — center left */}
        <motion.div
          style={{ y: auroraY2 }}
          className="absolute top-[25%] -left-[15%] w-[50vw] h-[50vw] max-w-[750px] max-h-[750px] rounded-full aurora-blob-2"
        />
        {/* Indigo blob — bottom */}
        <motion.div
          style={{ y: auroraY3 }}
          className="absolute top-[65%] right-[5%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] rounded-full aurora-blob-3"
        />
        {/* Subtle noise/grain overlay for texture */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />
      </div>

      {/* ══════════════════════════════════════════════════════
          FLOATING GLASS NAVBAR
         ══════════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.05 }}
        className={`fixed top-3 left-4 right-4 md:left-6 md:right-6 lg:left-8 lg:right-8 z-50 transition-all duration-500 rounded-[20px] ${
          scrolled ? 'glass-navbar-scrolled' : 'glass-navbar'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-6 h-[52px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground transition-transform duration-200 group-hover:scale-105">
              <FileCheck2 className="w-[18px] h-[18px]" />
            </div>
            <span className="font-bold text-lg tracking-tight">Clerkly</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-foreground/60">
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#security" className="hover:text-foreground transition-colors duration-200">Security</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="bg-foreground text-background px-5 py-2 rounded-xl text-sm font-semibold hover:bg-foreground/90 transition-colors"
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 -mr-2 text-foreground/60 hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? "auto" : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-5 pb-5 pt-2 space-y-3 border-t border-white/10 dark:border-white/5">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-foreground/60 hover:text-foreground py-1.5">How it works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-foreground/60 hover:text-foreground py-1.5">Features</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-foreground/60 hover:text-foreground py-1.5">Security</a>
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 text-center text-sm font-medium border border-white/20 dark:border-white/10 rounded-xl py-2.5 hover:bg-white/10 transition-colors">Sign In</Link>
              <Link href="/signup" className="flex-1 text-center text-sm font-semibold bg-foreground text-background rounded-xl py-2.5 hover:bg-foreground/90 transition-colors">Get Started</Link>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      <main className="relative z-10 pt-28 md:pt-36 pb-0">

        {/* ══════════════════════════════════════════════════════
            HERO SECTION
           ══════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Paperwork Automation</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.25 }}
            className="text-5xl sm:text-6xl md:text-[5rem] lg:text-[5.5rem] font-bold tracking-tight text-foreground max-w-4xl leading-[1.05]"
          >
            Paperwork,{" "}
            <span className="text-primary">handled.</span>
          </motion.h1>

          {/* Supporting copy */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.35 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            Clerkly turns time-consuming paperwork into intelligent, automated workflows — so you can focus on what matters.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.45 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </Link>
            <a href="#how-it-works">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="glass-surface px-8 py-3.5 rounded-2xl text-base font-semibold transition-all hover:bg-white/60 dark:hover:bg-white/10"
              >
                See how it works
              </motion.button>
            </a>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════════
            HERO PRODUCT VISUALIZATION — Layered Glass Workspace (3D)
           ══════════════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 mt-16 md:mt-24 mb-32 md:mb-40 relative">
          <motion.div
            style={{ y: vizY, scale: vizScale }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...gentleSpring, delay: 0.6 }}
            className="relative h-[450px] md:h-[550px] w-full"
          >
            <Hero3D />
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════════
            TRUST STRIP
           ══════════════════════════════════════════════════════ */}
        <section className="mb-28 md:mb-36">
          <div className="max-w-5xl mx-auto px-6">
            <Reveal>
              <div className="glass-surface rounded-2xl py-6 px-8 flex flex-col md:flex-row items-center justify-center gap-5 md:gap-12">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-center md:text-left shrink-0">
                  From paperwork to action
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                  {[
                    { icon: Brain, label: "AI-powered" },
                    { icon: Shield, label: "Secure" },
                    { icon: CheckCircle2, label: "Human-approved" },
                    { icon: Activity, label: "Action-oriented" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                      <item.icon className="w-4 h-4 text-primary" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            HOW IT WORKS — Glass workflow cards
           ══════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 mb-28 md:mb-36">
          <Reveal className="text-center mb-14 md:mb-16">
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-tight mb-4 leading-tight">
              From paperwork to done.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A simple workflow that keeps you in control.
            </p>
          </Reveal>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
              {[
                { step: "01", title: "Upload", desc: "Give Clerkly the document.", icon: Upload },
                { step: "02", title: "Understand", desc: "AI extracts information, deadlines, and required actions.", icon: Brain },
                { step: "03", title: "Review", desc: "Review and approve important actions before they happen.", icon: Eye },
                { step: "04", title: "Complete", desc: "Clerkly keeps the work moving and records what happened.", icon: CheckCircle2 }
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={spring}
                    className="relative z-10 glass-surface p-6 rounded-2xl h-full group cursor-default"
                  >
                    {/* Top highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-primary/15 mb-3">{item.step}</div>
                    <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            AI THINKS FOR YOU
           ══════════════════════════════════════════════════════ */}
        <section className="mb-28 md:mb-36 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <Reveal>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-tight leading-tight">
                  AI that thinks<br />for you.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                  Clerkly does the heavy lifting of reading and planning,
                  so you can focus on execution and approval.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={spring}
                className="glass-hero-panel rounded-2xl p-8 relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
                <h3 className="font-semibold text-primary mb-6 flex items-center gap-2 text-sm">
                  <Brain className="w-5 h-5" /> Clerkly found 3 things
                </h3>
                <div className="space-y-3 mb-8">
                  {["Renewal deadline", "Required signature", "Follow-up action"].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ ...spring, delay: 0.2 + i * 0.12 }}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white/40 dark:bg-white/[0.04] border border-white/30 dark:border-white/[0.06] backdrop-blur-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="font-medium text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/15 dark:border-white/[0.06] flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold text-lg">3 tasks created</span>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            FEATURES GRID
           ══════════════════════════════════════════════════════ */}
        <section id="features" className="max-w-7xl mx-auto px-6 mb-28 md:mb-36">
          <Reveal className="text-center mb-14 md:mb-16">
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-tight mb-4 leading-tight">
              Everything you need to<br className="hidden md:block" />manage paperwork.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {[
              { title: "AI Document Understanding", desc: "Turn unstructured paperwork into clear information and next steps.", icon: Brain },
              { title: "Smart Tasks", desc: "Automatically turn paperwork into actionable tasks.", icon: CheckSquare },
              { title: "Deadline Detection", desc: "Know what needs attention before important dates pass.", icon: Clock },
              { title: "Human Approval", desc: "Keep control over important actions with approval workflows.", icon: FileCheck2 },
              { title: "Activity History", desc: "See exactly what happened and when.", icon: Activity },
              { title: "Centralized Workspace", desc: "Documents, tasks, approvals, and activity — together.", icon: LayoutDashboard }
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={spring}
                  className="glass-surface p-7 rounded-2xl group h-full cursor-default"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2 text-[15px]">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            HUMAN IN THE LOOP
           ══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 mb-28 md:mb-36 text-center">
          <Reveal>
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-tight mb-6 leading-tight">
              AI moves the work forward.<br />
              <span className="text-primary">You stay in control.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
              Clerkly identifies actions and prepares work, but important decisions remain with you.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass-hero-panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-2">
                {[
                  { label: "AI detects", highlight: false },
                  { label: "AI prepares", highlight: false },
                  { label: "You review", highlight: true },
                  { label: "Approve / Reject", highlight: true },
                  { label: "Action completed", highlight: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-2">
                    <div className={`text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ${
                      step.highlight
                        ? 'bg-primary/15 text-primary'
                        : 'text-foreground/70'
                    }`}>
                      {step.label}
                    </div>
                    {i < 4 && <ArrowRight className="w-4 h-4 text-muted-foreground/30 rotate-90 md:rotate-0 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECURITY — Glass trust panel
           ══════════════════════════════════════════════════════ */}
        <section id="security" className="mb-28 md:mb-36">
          <div className="max-w-5xl mx-auto px-6">
            <Reveal>
              <div className="glass-hero-panel rounded-3xl py-16 md:py-20 px-8 md:px-14 text-center relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
                {/* Subtle dark overlay */}
                <div className="absolute inset-0 bg-foreground/[0.02] dark:bg-foreground/[0.03] rounded-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-tight mb-4 leading-tight">
                    Your documents stay protected.
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-14">
                    Security is built into every layer of Clerkly.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-3xl mx-auto">
                    {[
                      { icon: Lock, title: "Encrypted", desc: "Data protected at rest and in transit." },
                      { icon: Fingerprint, title: "Private", desc: "Your documents are never shared." },
                      { icon: Eye, title: "Auditable", desc: "Complete history of every action." },
                    ].map((item, i) => (
                      <Reveal key={i} delay={i * 0.1}>
                        <div className="flex flex-col items-center">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="font-semibold mb-1.5 text-[15px]">{item.title}</div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            FINAL CTA — Aurora glass section
           ══════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-28 md:mb-36">
          <Reveal>
            <div className="glass-hero-panel rounded-3xl p-10 md:p-16 relative overflow-hidden">
              {/* Aurora gradient inside */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-cyan-500/[0.04] to-primary/[0.06] pointer-events-none rounded-3xl" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/15 to-transparent" />

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                  Ready to leave<br />paperwork behind?
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
                  Let Clerkly understand the paperwork and keep the work moving.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/signup">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <Link href="/login">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="glass-surface px-8 py-3.5 rounded-2xl text-base font-semibold transition-all w-full sm:w-auto hover:bg-white/60 dark:hover:bg-white/10"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

      </main>

      {/* ══════════════════════════════════════════════════════
          FOOTER
         ══════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-border/30 bg-background/60 backdrop-blur-md pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                <FileCheck2 className="w-[18px] h-[18px]" />
              </div>
              <span className="font-bold text-lg tracking-tight">Clerkly</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              AI-powered paperwork assistant. Turn unstructured documents into clear information and actionable next steps.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
              <li><a href="#security" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Account</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Get Started</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-border/20 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Clerkly Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
