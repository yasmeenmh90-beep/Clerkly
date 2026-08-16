export type TaskStatus = "pending" | "in_progress" | "waiting_approval" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  task_id: string;
  title: string;
  status: TaskStatus;
  document_type: string;
  deadline: string;
  requires_signature: boolean;
  requires_payment: boolean;
  amount?: number;
  priority: TaskPriority;
  created_at: string;
}

export interface Activity {
  activity_id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "document_uploaded" | "task_created" | "approval_requested" | "payment_approved" | "task_completed";
}

export interface Approval {
  approval_id: string;
  task_id: string;
  title: string;
  type: "payment" | "signature" | "human_decision";
  document_type: string;
  amount?: number;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export interface Document {
  document_id: string;
  filename: string;
  file_size: number; // in bytes
  file_type: string;
  uploaded_at: string;
  status: "processing" | "processed" | "error";
}

export interface Notification {
  notification_id: string;
  title: string;
  description: string;
  timestamp: string;
  is_read: boolean;
  type: "info" | "warning" | "success" | "error";
}
