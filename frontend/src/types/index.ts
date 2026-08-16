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
