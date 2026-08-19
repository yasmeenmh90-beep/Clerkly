"use client"

import { OverviewCards } from "@/components/dashboard/OverviewCards"
import { PriorityTasks } from "@/components/dashboard/PriorityTasks"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines"
import { ProcessingDocuments } from "@/components/dashboard/ProcessingDocuments"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

function DashboardContent() {
  const searchParams = useSearchParams()
  // Also listen for our custom event in case router doesn't trigger re-render
  const [query, setQuery] = useState(searchParams?.get("q") || "")

  useEffect(() => {
    const handleSearch = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") || "");
    }
    window.addEventListener("search-updated", handleSearch);
    return () => window.removeEventListener("search-updated", handleSearch);
  }, []);

  // Update when URL changes natively
  useEffect(() => {
    setQuery(searchParams?.get("q") || "")
  }, [searchParams])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 260, damping: 20 } }
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div 
        variants={itemVariants}
        className="flex flex-col gap-1 mt-2"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Good morning, Pruthviraj</h1>
        <p className="text-muted-foreground text-sm">Here's what needs your attention today.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <OverviewCards />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[minmax(400px,auto)]">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex-1">
            <PriorityTasks searchQuery={query} />
          </div>
          <div className="flex-1">
            <UpcomingDeadlines searchQuery={query} />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex-1">
            <ProcessingDocuments searchQuery={query} />
          </div>
          <div className="flex-1">
            <RecentActivity searchQuery={query} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
