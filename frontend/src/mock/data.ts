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
    title: "Insurance Renewal Signature",
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
    title: "Office Lease Agreement",
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
    title: "Q3 Tax Filing Documents",
    status: "completed",
    document_type: "Tax Form",
    deadline: "2026-08-10",
    requires_signature: false,
    requires_payment: false,
    priority: "medium",
    created_at: "2026-08-01T14:20:00Z"
  },
  {
    task_id: "t-105",
    title: "Software Subscription Invoice",
    status: "waiting_approval",
    document_type: "Invoice",
    deadline: "2026-08-17",
    requires_signature: false,
    requires_payment: true,
    amount: 299,
    priority: "medium",
    created_at: "2026-08-16T08:00:00Z"
  },
  {
    task_id: "t-106",
    title: "New Employee NDA",
    status: "pending",
    document_type: "Legal Document",
    deadline: "2026-08-22",
    requires_signature: true,
    requires_payment: false,
    priority: "low",
    created_at: "2026-08-16T09:45:00Z"
  },
  {
    task_id: "t-107",
    title: "Quarterly Audit Report Review",
    status: "in_progress",
    document_type: "Report",
    deadline: "2026-08-30",
    requires_signature: false,
    requires_payment: false,
    priority: "high",
    created_at: "2026-08-13T16:20:00Z"
  },
  {
    task_id: "t-108",
    title: "Marketing Budget Approval",
    status: "waiting_approval",
    document_type: "Financial Plan",
    deadline: "2026-08-19",
    requires_signature: true,
    requires_payment: false,
    priority: "high",
    created_at: "2026-08-16T11:00:00Z"
  }
];

export const mockActivities: Activity[] = [
  {
    activity_id: "a-1",
    title: "Payment Approved",
    description: "Cloud hosting bill payment of ₹450 approved by admin.",
    timestamp: "10 mins ago",
    type: "payment_approved"
  },
  {
    activity_id: "a-2",
    title: "Approval Requested",
    description: "Software Subscription Invoice requires your approval.",
    timestamp: "2 hours ago",
    type: "approval_requested"
  },
  {
    activity_id: "a-3",
    title: "Document Uploaded",
    description: "New_Employee_NDA_v2.pdf was uploaded.",
    timestamp: "4 hours ago",
    type: "document_uploaded"
  },
  {
    activity_id: "a-4",
    title: "Task Completed",
    description: "Q3 Tax Filing Documents have been verified and processed.",
    timestamp: "1 day ago",
    type: "task_completed"
  },
  {
    activity_id: "a-5",
    title: "AI Processing Complete",
    description: "Marketing Budget Approval document has been successfully summarized by Clerkly AI.",
    timestamp: "1 day ago",
    type: "task_created"
  }
];

export const mockStats = {
  total: 8,
  pending: 2,
  waitingApproval: 3,
  completed: 1
};

export const mockDocuments = [
  {
    document_id: "doc-1",
    filename: "Annual_Report_2025.pdf",
    file_size: 4500000,
    file_type: "pdf",
    uploaded_at: "2026-08-17T10:00:00Z",
    status: "processing"
  },
  {
    document_id: "doc-2",
    filename: "Vendor_Contract_Q4.docx",
    file_size: 1200000,
    file_type: "docx",
    uploaded_at: "2026-08-17T11:15:00Z",
    status: "processing"
  },
  {
    document_id: "doc-3",
    filename: "Tax_Summary_Q3.pdf",
    file_size: 250000,
    file_type: "pdf",
    uploaded_at: "2026-08-16T14:20:00Z",
    status: "processed"
  }
];
