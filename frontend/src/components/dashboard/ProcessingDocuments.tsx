"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Link from "next/link"

import {
  motion,
} from "framer-motion"

import {
  ArrowRight,
  File,
  FileText,
  Loader2,
  SearchX,
} from "lucide-react"

import type {
  Task,
} from "@/types"

import {
  getTasks,
} from "@/lib/api"

import {
  TaskStatusBadge,
} from "@/components/ui/badges"


interface ProcessingDocumentsProps {
  searchQuery?: string
}


export function ProcessingDocuments({
  searchQuery = "",
}: ProcessingDocumentsProps) {
  const [tasks, setTasks] =
    useState<Task[]>([])

  const [isLoading, setIsLoading] =
    useState(true)


  useEffect(() => {
    async function fetchDocumentTasks(): Promise<void> {
      try {
        setIsLoading(true)

        const data = await getTasks({
          source: "document",
          page: 1,
          page_size: 100,
        })

        setTasks(data)
      } catch (error) {
        console.error(
          "Failed to load document tasks",
          error,
        )
      } finally {
        setIsLoading(false)
      }
    }


    function handleTaskUpdate(): void {
      void fetchDocumentTasks()
    }


    void fetchDocumentTasks()

    window.addEventListener(
      "task-updated",
      handleTaskUpdate,
    )

    return () => {
      window.removeEventListener(
        "task-updated",
        handleTaskUpdate,
      )
    }
  }, [])


  const documentTasks = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase()

    return tasks.filter((task) => {
      return (
        normalizedSearch.length === 0 ||
        task.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        (task.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (task.required_action ?? "")
          .toLowerCase()
          .includes(normalizedSearch)
      )
    })
  }, [
    tasks,
    searchQuery,
  ])


  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/10 p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Document Tasks
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Tasks extracted from uploaded documents
          </p>
        </div>

        <Link
          href="/documents"
          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Upload

          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>


      <div className="relative min-h-[200px] flex-1 divide-y divide-border">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : documentTasks.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              {searchQuery ? (
                <SearchX className="h-5 w-5 text-muted-foreground opacity-50" />
              ) : (
                <File className="h-5 w-5 text-muted-foreground opacity-50" />
              )}
            </div>

            <p className="text-sm font-medium text-foreground">
              {searchQuery
                ? "No matching document tasks"
                : "No document tasks yet"}
            </p>

            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              {searchQuery
                ? "Try a different search term."
                : "Upload a document to create an analyzed task."}
            </p>
          </div>
        ) : (
          documentTasks
            .slice(0, 4)
            .map((task, index) => (
              <motion.div
                key={task.task_id}
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                }}
                className="p-5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-xl border border-border bg-accent/50 p-3 text-foreground">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-foreground">
                      {task.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {task.description ??
                        task.required_action ??
                        "Task extracted from an uploaded document"}
                    </p>

                    <div className="mt-3">
                      <TaskStatusBadge
                        status={task.status}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
        )}
      </div>
    </div>
  )
}