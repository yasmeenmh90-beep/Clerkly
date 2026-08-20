"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const spring: any = { type: "spring", stiffness: 260, damping: 20 }

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#0ea5e9] flex items-center justify-center text-white shadow-md shadow-sky-200 transition-transform group-hover:scale-105">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Clerkly</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
          <a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          <a href="#security" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Security</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">
              Get Started
            </button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-slate-500 hover:text-slate-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 shadow-lg absolute w-full">
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 py-2 border-b border-slate-50">How it works</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 py-2 border-b border-slate-50">Features</a>
          <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-600 py-2 border-b border-slate-50">Security</a>
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-center text-slate-600 py-2">
              Sign In
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  )
}
