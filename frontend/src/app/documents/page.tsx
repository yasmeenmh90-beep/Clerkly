"use client"

import {
  useRef,
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  AlertCircle,
  CheckCircle2,
  File as FileIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react"

import type {
  Task,
} from "@/types"

import {
  ApiError,
  uploadDocument,
} from "@/lib/api"


type UploadState =
  | "idle"
  | "uploading"
  | "success"
  | "error"


const MAX_UPLOAD_SIZE_BYTES =
  5 * 1024 * 1024

const ALLOWED_EXTENSIONS = [
  "txt",
  "pdf",
  "docx",
]


function formatFileSize(
  bytes: number,
): string {
  if (bytes === 0) {
    return "0 Bytes"
  }

  const unitSize = 1024
  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ]

  const unitIndex = Math.min(
    Math.floor(
      Math.log(bytes) / Math.log(unitSize),
    ),
    units.length - 1,
  )

  const value =
    bytes / Math.pow(unitSize, unitIndex)

  return `${value.toFixed(2)} ${units[unitIndex]}`
}


function getFileExtension(
  file: File,
): string {
  return (
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? ""
  )
}


function validateFile(
  file: File,
): string | null {
  const extension = getFileExtension(file)

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return (
      "Unsupported file type. Select a TXT, PDF, " +
      "or DOCX document."
    )
  }

  if (file.size === 0) {
    return "The selected document is empty."
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return (
      "The selected document exceeds the " +
      "5 MB upload limit."
    )
  }

  return null
}


export default function DocumentsPage() {
  const inputRef =
    useRef<HTMLInputElement>(null)

  const [showUploadModal, setShowUploadModal] =
    useState(false)

  const [dragActive, setDragActive] =
    useState(false)

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [uploadState, setUploadState] =
    useState<UploadState>("idle")

  const [uploadedTask, setUploadedTask] =
    useState<Task | null>(null)

  const [error, setError] =
    useState<string | null>(null)


  function resetUpload(): void {
    setSelectedFile(null)
    setUploadedTask(null)
    setUploadState("idle")
    setError(null)
    setDragActive(false)

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }


  function closeUploadModal(): void {
    if (uploadState === "uploading") {
      return
    }

    setShowUploadModal(false)
    resetUpload()
  }


  function selectFile(
    file: File,
  ): void {
    const validationError =
      validateFile(file)

    setUploadedTask(null)

    if (validationError) {
      setSelectedFile(null)
      setUploadState("error")
      setError(validationError)

      if (inputRef.current) {
        inputRef.current.value = ""
      }

      return
    }

    setSelectedFile(file)
    setUploadState("idle")
    setError(null)
  }


  function handleDrag(
    event: React.DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault()
    event.stopPropagation()

    if (
      event.type === "dragenter" ||
      event.type === "dragover"
    ) {
      setDragActive(true)
    }

    if (event.type === "dragleave") {
      setDragActive(false)
    }
  }


  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
  ): void {
    event.preventDefault()
    event.stopPropagation()

    setDragActive(false)

    const file =
      event.dataTransfer.files.item(0)

    if (file) {
      selectFile(file)
    }
  }


  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const file =
      event.target.files?.item(0)

    if (file) {
      selectFile(file)
    }
  }


  async function handleUpload(): Promise<void> {
    if (!selectedFile) {
      return
    }

    const validationError =
      validateFile(selectedFile)

    if (validationError) {
      setUploadState("error")
      setError(validationError)
      return
    }

    try {
      setUploadState("uploading")
      setError(null)

      const createdTask =
        await uploadDocument(selectedFile)

      setUploadedTask(createdTask)
      setUploadState("success")
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message)
      } else {
        setError(
          "Document upload failed. Please try again.",
        )
      }

      setUploadState("error")
    }
  }


  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Documents
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Upload a document for secure task extraction
            and analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowUploadModal(true)
          }
          className="flex h-10 items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <UploadCloud className="h-4 w-4" />

          Upload Document
        </button>
      </div>


      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileIcon className="h-8 w-8 text-primary" />
          </div>

          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Convert paperwork into an actionable task
          </h2>

          <p className="max-w-lg text-sm leading-6 text-muted-foreground">
            Upload a TXT, PDF, or DOCX document.
            Clerkly validates the file, extracts its
            contents, analyzes the paperwork, and creates
            a task that you can review and approve.
          </p>

          <button
            type="button"
            onClick={() =>
              setShowUploadModal(true)
            }
            className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <UploadCloud className="h-4 w-4" />

            Select a document
          </button>
        </div>
      </div>


      {uploadedTask && (
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-xl border border-success/20 bg-success/5 p-5"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />

            <div>
              <h3 className="font-semibold text-foreground">
                Task created successfully
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {uploadedTask.title}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                Task ID: {uploadedTask.task_id}
              </p>
            </div>
          </div>
        </motion.div>
      )}


      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={
                  uploadState === "uploading"
                }
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                aria-label="Close upload dialog"
              >
                <X className="h-4 w-4" />
              </button>


              <h2 className="mb-1 text-lg font-semibold text-foreground">
                Upload Document
              </h2>

              <p className="mb-5 text-sm text-muted-foreground">
                Supported formats: TXT, PDF, and DOCX,
                up to 5 MB.
              </p>


              <div
                className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                } ${
                  uploadState === "uploading"
                    ? "pointer-events-none opacity-60"
                    : ""
                }`}
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
                  accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />


                {!selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-muted p-3 text-muted-foreground">
                      <UploadCloud className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Drag and drop your document here
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          inputRef.current?.click()
                        }
                        className="mt-1 text-xs font-medium text-primary hover:underline"
                      >
                        or browse files
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <FileIcon className="h-6 w-6" />
                    </div>

                    <div className="max-w-full px-4">
                      <p className="truncate text-sm font-medium text-foreground">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatFileSize(
                          selectedFile.size,
                        )}
                      </p>
                    </div>

                    {uploadState !== "uploading" && (
                      <button
                        type="button"
                        onClick={resetUpload}
                        className="text-xs font-medium text-danger hover:underline"
                      >
                        Remove file
                      </button>
                    )}
                  </div>
                )}
              </div>


              {uploadState === "uploading" && (
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />

                  Uploading and analyzing document...
                </div>
              )}


              {uploadState === "success" &&
                uploadedTask && (
                  <div className="mt-5 rounded-lg border border-success/20 bg-success/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-success">
                      <CheckCircle2 className="h-4 w-4" />

                      Document analyzed successfully
                    </div>

                    <p className="mt-2 text-sm font-medium text-foreground">
                      {uploadedTask.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Status:{" "}
                      {uploadedTask.status.replaceAll(
                        "_",
                        " ",
                      )}
                    </p>
                  </div>
                )}


              {uploadState === "error" &&
                error && (
                  <div className="mt-5 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>{error}</span>
                  </div>
                )}


              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={
                    uploadState === "uploading"
                  }
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {uploadState === "success"
                    ? "Close"
                    : "Cancel"}
                </button>

                {uploadState !== "success" && (
                  <button
                    type="button"
                    onClick={() =>
                      void handleUpload()
                    }
                    disabled={
                      !selectedFile ||
                      uploadState === "uploading"
                    }
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadState === "uploading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}

                    {uploadState === "uploading"
                      ? "Processing..."
                      : "Upload"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}