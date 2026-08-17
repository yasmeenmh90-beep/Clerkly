"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Loader2, Search, Trash2, FileText, Download } from "lucide-react"
import { getDocuments, uploadDocument } from "@/lib/api"
import { Document } from "@/types"

type UploadState = "idle" | "uploading" | "success" | "error"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Upload State
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all"|"processing"|"processed"|"failed">("all")
  
  // Delete Confirmation
  const [docToDelete, setDocToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const data = await getDocuments()
      setDocuments(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || (statusFilter === "failed" ? doc.status === "error" : doc.status === statusFilter)
      return matchesSearch && matchesStatus
    })
  }, [documents, searchQuery, statusFilter])

  const handleDelete = async () => {
    if (!docToDelete) return
    // Mock delete
    setDocuments(prev => prev.filter(d => d.document_id !== docToDelete))
    setDocToDelete(null)
  }

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelection(e.dataTransfer.files[0])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) handleFileSelection(e.target.files[0])
  }

  const handleFileSelection = (file: globalThis.File) => {
    setSelectedFile(file)
    setUploadState("idle")
    setUploadProgress(0)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadState("idle")
    setUploadProgress(0)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploadState("uploading")
    
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 150)

    try {
      const result = await uploadDocument(selectedFile)
      clearInterval(interval)
      setUploadProgress(100)
      setUploadState("success")
      
      // Add to local state
      setDocuments(prev => [result, ...prev])
      
      setTimeout(() => {
        setShowUploadModal(false)
        removeFile()
      }, 2000)
    } catch (err) {
      clearInterval(interval)
      setUploadState("error")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage and upload your files.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-2 whitespace-nowrap"
        >
          <UploadCloud className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary transition-all text-foreground"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-10 px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary text-foreground cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="processed">Processed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>Loading documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <File className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No documents found</h3>
            <p className="text-sm text-muted-foreground">Upload a new document or adjust your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc.document_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group p-4 sm:p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{doc.filename}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span className="uppercase">{doc.file_type}</span>
                    <span>•</span>
                    <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {doc.status === "processing" && (
                      <span className="text-primary flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full"><Loader2 className="w-4 h-4 animate-spin" /> Processing</span>
                    )}
                    {doc.status === "processed" && (
                      <span className="text-success flex items-center gap-2 bg-success/10 px-3 py-1 rounded-full"><CheckCircle2 className="w-4 h-4" /> Ready</span>
                    )}
                    {doc.status === "error" && (
                      <span className="text-danger flex items-center gap-2 bg-danger/10 px-3 py-1 rounded-full"><AlertCircle className="w-4 h-4" /> Failed</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDocToDelete(doc.document_id)}
                      className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {docToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Document</h3>
              <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this document? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDocToDelete(null)} className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-lg font-medium text-sm transition-colors shadow-sm">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
            >
              <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"><X className="w-4 h-4" /></button>
              <h3 className="text-lg font-semibold text-foreground mb-4">Upload Document</h3>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 transition-colors text-center relative ${dragActive ? "border-primary bg-primary/5" : "border-border/60 hover:border-border hover:bg-muted/30"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                
                {!selectedFile ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-muted text-muted-foreground rounded-full"><UploadCloud className="w-6 h-6" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Drag & drop your file here</p>
                      <p className="text-xs text-muted-foreground mt-1">or <button onClick={() => inputRef.current?.click()} className="text-primary hover:underline">browse files</button></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-full"><File className="w-6 h-6" /></div>
                    <div className="max-w-full px-4">
                      <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    {uploadState === "idle" && (
                      <button onClick={removeFile} className="text-xs text-danger hover:underline mt-2">Remove file</button>
                    )}
                  </div>
                )}
              </div>

              {uploadState === "uploading" && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.2 }} />
                  </div>
                </div>
              )}

              {uploadState === "success" && (
                <div className="mt-6 p-3 bg-success/10 text-success rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Upload successful!
                </div>
              )}

              {uploadState === "error" && (
                <div className="mt-6 p-3 bg-danger/10 text-danger rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" /> Upload failed. Please try again.
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-end">
                <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors">Cancel</button>
                <button onClick={handleUpload} disabled={!selectedFile || uploadState !== "idle"} className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
