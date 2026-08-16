import { Task, Activity } from "../types";

export const mockTasks: Task[] = [
  {
    task_id: "t-101",
    title: "Electricity Bill Payment",
    status: "waiting_approval",
    document_type: "Utility Bill",
    deadline: "2026-08-18",
    requires_signature: false,
    requires_payment: true,
    amount: 150,
    priority: "high",
    created_at: "2026-08-15T10:00:00Z"
  },
  {
    task_id: "t-102",
    title: "Insurance Renewal",
    status: "pending",
    document_type: "Insurance Policy",
    deadline: "2026-08-20",
    requires_signature: true,
    requires_payment: true,
    amount: 1200,
    priority: "medium",
    created_at: "2026-08-15T11:30:00Z"
  },
  {
    task_id: "t-103",
    title: "Rental Agreement",
    status: "in_progress",
    document_type: "Contract",
    deadline: "2026-08-25",
    requires_signature: true,
    requires_payment: false,
    priority: "high",
    created_at: "2026-08-14T09:15:00Z"
  },
  {
    task_id: "t-104",
    title: "Government Form Submission",
    status: "completed",
    document_type: "Official Form",
    deadline: "2026-08-10",
    requires_signature: false,
    requires_payment: false,
    priority: "low",
    created_at: "2026-08-01T14:20:00Z"
  }
];

export const mockActivities: Activity[] = [
  {
    activity_id: "a-1",
    title: "Payment Approved",
    description: "Water bill payment of ₹45 approved by Sarah.",
    timestamp: "2 hours ago",
    type: "payment_approved"
  },
  {
    activity_id: "a-2",
    title: "Approval Requested",
    description: "Electricity bill requires your approval.",
    timestamp: "5 hours ago",
    type: "approval_requested"
  },
  {
    activity_id: "a-3",
    title: "Document Uploaded",
    description: "Rental Agreement.pdf was uploaded.",
    timestamp: "1 day ago",
    type: "document_uploaded"
  }
];

export const mockStats = {
  total: 12,
  pending: 4,
  waitingApproval: 3,
  completed: 5
};
