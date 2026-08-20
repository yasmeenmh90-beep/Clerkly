"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Resources', href: '#resources' },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-navbar-scrolled' : 'glass-navbar'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="font-black text-lg tracking-tight text-foreground">Clerkly</span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <Link href="/login" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:opacity-90 transition-opacity shadow-sm">
              Get Started
            </button>
          </Link>
        </div>

        <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden glass-navbar-scrolled px-6 py-4 flex flex-col gap-3 absolute w-full top-16">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-muted-foreground py-2 border-b border-border">
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-center text-muted-foreground py-2">Sign In</Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full bg-primary text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md">Get Started</button>
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  )
}
