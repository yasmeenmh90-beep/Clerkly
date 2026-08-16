"use client"

import { OverviewCards } from "@/components/dashboard/OverviewCards"
import { PriorityTasks } from "@/components/dashboard/PriorityTasks"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { motion } from "framer-motion"

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-1 mt-2"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Good morning, Pruthviraj</h1>
        <p className="text-muted-foreground text-sm">Here's what needs your attention today.</p>
      </motion.div>

      <OverviewCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[minmax(500px,auto)]">
        <div className="lg:col-span-2 h-full">
          <PriorityTasks />
        </div>
        <div className="h-full">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
