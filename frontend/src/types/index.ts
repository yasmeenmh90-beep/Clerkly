export type BackendTaskStatus =
  | "pending"
  | "in_progress"
  | "awaiting_approval"
  | "approved"
  | "completed"
  | "rejected"
  | "failed"

export type TaskStatus = BackendTaskStatus

export type TaskSource =
  | "email"
  | "document"
  | "manual"

export interface Task {
  task_id: string
  title: string
  description: string | null
  source: TaskSource
  status: BackendTaskStatus
  deadline: string | null
  required_action: string | null
  requires_signature: boolean
  requires_payment: boolean
  payment_amount: number | null
  currency: string | null
  approval_required: boolean
}

export interface TaskEvent {
  event_id: number
  task_id: string
  event_type: string
  previous_status: string | null
  new_status: string
  message: string | null
  created_at: string
}

export interface CheckoutSession {
  provider: "stripe"
  session_id: string
  checkout_url: string
  payment_status: string
}

export interface User {
  user_id: string
  email: string
  full_name: string | null
  is_active: boolean
  created_at: string
  gmail_connected: boolean
}

export interface AccessToken {
  access_token: string
  token_type: "bearer"
}

export interface RegisterInput {
  email: string
  password: string
  full_name?: string
}

export type ActivityType =
  | "document_uploaded"
  | "task_created"
  | "approval_requested"
  | "payment_approved"
  | "task_completed"

export interface Activity {
  activity_id: string
  title: string
  description: string
  timestamp: string
  type: ActivityType
}

export type NotificationType =
  | "info"
  | "warning"
  | "success"
  | "error"

export interface Notification {
  notification_id: string
  title: string
  description: string
  timestamp: string
  is_read: boolean
  type: NotificationType
}