"use client"

import { motion } from "framer-motion"
import { File, FileText, Loader2, SearchX } from "lucide-react"
import { useState, useEffect } from "react"
import { getDocuments } from "@/lib/api"
import { Document } from "@/types"

export function ProcessingDocuments({ searchQuery }: { searchQuery?: string }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setIsLoading(true)
        const data = await getDocuments()
        let filtered = data.filter(d => d.status === "processing")
        if (searchQuery) {
          filtered = filtered.filter(d => 
            d.filename.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        setDocuments(filtered)
      } catch (err) {
        console.error("Failed to load documents", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDocs()
  }, [searchQuery])

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-border flex justify-between items-center bg-muted/10">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Processing Documents</h2>
          <p className="text-xs text-muted-foreground mt-1">AI is currently analyzing these files</p>
        </div>
      </div>
      
      <div className="divide-y divide-border flex-1 relative min-h-[200px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3">
              {searchQuery ? <SearchX className="w-5 h-5 text-muted-foreground opacity-50" /> : <File className="w-5 h-5 text-muted-foreground opacity-50" />}
            </div>
            <p className="text-sm font-medium text-foreground">{searchQuery ? "No matching documents" : "No documents processing"}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{searchQuery ? "Try a different search term" : "Your processing queue is clear."}</p>
          </div>
        ) : (
          documents.slice(0, 4).map((doc, i) => (
            <motion.div 
              key={doc.document_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="p-5 hover:bg-muted/50 transition-colors group relative"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/50 text-foreground border border-border relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                  <FileText className="w-5 h-5 relative z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">{doc.filename}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{(doc.file_size / 1024 / 1024).toFixed(1)} MB • {doc.file_type.toUpperCase()}</p>
                    <span className="text-xs font-medium text-primary flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary" 
                      initial={{ width: "20%" }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
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
