"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type UploadState = "idle" | "uploading" | "success" | "error"

export default function DocumentsPage() {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (file: File) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const simulateUpload = () => {
    if (!selectedFile) return
    setUploadState("uploading")
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploadState("success")
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">Upload Document</h2>
        <p className="text-sm text-muted-foreground">Upload your files for processing and AI analysis.</p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          dragActive ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/30"
        } ${uploadState !== "idle" && uploadState !== "error" ? "pointer-events-none opacity-60" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        />
        
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`p-4 rounded-full ${dragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground mb-1">
              Drag & drop your file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            <button 
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              disabled={uploadState === "uploading" || uploadState === "success"}
            >
              Browse Files
            </button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-4">
            Supports PDF, DOCX, PNG, JPG up to 10MB
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <File className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="uppercase">{selectedFile.name.split('.').pop()}</span>
                </div>
              </div>

              {uploadState === "idle" || uploadState === "error" ? (
                <button 
                  onClick={removeFile}
                  className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : uploadState === "success" ? (
                <div className="p-2 text-success">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : null}
            </div>

            {uploadState === "uploading" && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: \`\${uploadProgress}%\` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            )}
            
            {uploadState === "success" && (
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-sm text-success font-medium">
                <CheckCircle2 className="w-4 h-4" /> File uploaded successfully
              </div>
            )}

            {uploadState === "error" && (
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-sm text-danger font-medium">
                <AlertCircle className="w-4 h-4" /> Upload failed. Please try again.
              </div>
            )}

            {uploadState === "idle" && (
              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <button
                  onClick={simulateUpload}
                  className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto"
                >
                  Upload File
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
