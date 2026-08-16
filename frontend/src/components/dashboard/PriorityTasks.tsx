"use client"

import { mockTasks } from "@/mock/data"
import { TaskStatusBadge, PriorityBadge } from "../ui/badges"
import { motion } from "framer-motion"
import { FileText, IndianRupee, PenTool, ArrowRight, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function PriorityTasks() {
  const router = useRouter();

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-border flex justify-between items-center bg-muted/10">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Needs Attention</h2>
          <p className="text-xs text-muted-foreground mt-1">Tasks requiring your immediate action</p>
        </div>
        <Link href="/tasks" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="divide-y divide-border flex-1">
        {mockTasks.slice(0, 4).map((task, i) => (
          <motion.div 
            key={task.task_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            onClick={() => router.push('/tasks')}
            className="p-5 hover:bg-muted/50 transition-colors group cursor-pointer relative"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/50 text-foreground border border-border mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">{task.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{task.document_type} • Due {new Date(task.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <TaskStatusBadge status={task.status} />
            </div>
            
            <div className="mt-4 flex items-center gap-4 pl-11">
              <PriorityBadge priority={task.priority} />
              
              {task.requires_payment && task.amount && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/50">
                  <IndianRupee className="w-3 h-3" />
                  <span>{task.amount}</span>
                </div>
              )}
              
              {task.requires_signature && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/50">
                  <PenTool className="w-3 h-3" />
                  <span>Signature required</span>
                </div>
              )}
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
