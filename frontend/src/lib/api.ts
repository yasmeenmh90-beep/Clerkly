import {
  AccessToken,
  Activity,
  BackendTaskStatus,
  CheckoutSession,
  Notification,
  RegisterInput,
  Task,
  TaskEvent,
  User,
} from "@/types"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000"


// ==================================================
// API error
// ==================================================

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}


// ==================================================
// Authentication token storage
// ==================================================

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem("clerkly_access_token")
}


export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("clerkly_access_token", token)
}


export function clearAccessToken(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem("clerkly_access_token")
}


export function isAuthenticated(): boolean {
  return Boolean(getAccessToken())
}


// ==================================================
// Current organization storage
// ==================================================

const ORGANIZATION_STORAGE_KEY = "clerkly_organization_id"


export function getCurrentOrganizationId(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem(ORGANIZATION_STORAGE_KEY)
}


export function setCurrentOrganizationId(
  organizationId: string,
): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(
    ORGANIZATION_STORAGE_KEY,
    organizationId,
  )
}


export function clearCurrentOrganizationId(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(ORGANIZATION_STORAGE_KEY)
}


// ==================================================
// Shared request function
// ==================================================

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken()
  const headers = new Headers(options.headers)

  const isFormData = options.body instanceof FormData
  const isUrlEncoded = options.body instanceof URLSearchParams

  if (!isFormData && !isUrlEncoded && options.body !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }
  }

  if (isUrlEncoded && !headers.has("Content-Type")) {
    headers.set(
      "Content-Type",
      "application/x-www-form-urlencoded",
    )
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const organizationId = getCurrentOrganizationId()

  if (organizationId && !headers.has("X-Organization-ID")) {
    headers.set("X-Organization-ID", organizationId)
  }

  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError(
      "Unable to connect to the Clerkly backend. Make sure FastAPI is running on port 8000.",
      0,
    )
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const body: unknown = await response.json()

      if (
        typeof body === "object" &&
        body !== null &&
        "detail" in body
      ) {
        const detail = (
          body as {
            detail?: unknown
          }
        ).detail

        if (typeof detail === "string") {
          message = detail
        } else if (Array.isArray(detail)) {
          message = detail
            .map((item) => {
              if (
                typeof item === "object" &&
                item !== null &&
                "msg" in item
              ) {
                return String(
                  (item as { msg: unknown }).msg,
                )
              }

              return String(item)
            })
            .join(", ")
        }
      }
    } catch {
      // The backend response was not JSON.
    }

    if (response.status === 401) {
      clearAccessToken()
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}


// ==================================================
// Authentication API
// ==================================================

export async function register(
  input: RegisterInput,
): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })
}


export async function login(
  email: string,
  password: string,
): Promise<AccessToken> {
  const formData = new URLSearchParams()

  formData.set("username", email)
  formData.set("password", password)

  const token = await request<AccessToken>(
    "/auth/token",
    {
      method: "POST",
      body: formData,
    },
  )

  setAccessToken(token.access_token)

  return token
}


export function logout(): void {
  clearAccessToken()
  clearCurrentOrganizationId()
}


export async function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me")
}


// ==================================================
// Organization API
// ==================================================

export type OrganizationRole = "owner" | "admin" | "member"


export interface Organization {
  organization_id: string
  name: string
  owner_id: string
  created_at: string
  role: OrganizationRole
}


export interface OrganizationMember {
  membership_id: string
  user_id: string
  role: OrganizationRole
  joined_at: string
  email: string
  full_name: string | null
}


export interface OrganizationInvite {
  invite_id: string
  organization_id: string
  invited_email: string
  role: OrganizationRole
  created_at: string
  expires_at: string
  accepted_at: string | null
}


export async function getOrganizations(): Promise<
  Organization[]
> {
  return request<Organization[]>("/organizations/")
}


export async function createOrganization(
  name: string,
): Promise<Organization> {
  return request<Organization>("/organizations/", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}


export async function getOrganizationMembers(): Promise<
  OrganizationMember[]
> {
  return request<OrganizationMember[]>(
    "/organizations/members",
  )
}


export async function inviteMember(
  email: string,
  role: OrganizationRole = "member",
): Promise<OrganizationInvite> {
  return request<OrganizationInvite>(
    "/organizations/members/invite",
    {
      method: "POST",
      body: JSON.stringify({ email, role }),
    },
  )
}


export async function acceptInvite(
  token: string,
): Promise<OrganizationMember> {
  return request<OrganizationMember>(
    `/organizations/invites/${encodeURIComponent(
      token,
    )}/accept`,
    {
      method: "POST",
    },
  )
}


export async function removeMember(
  userId: string,
): Promise<void> {
  await request<void>(
    `/organizations/members/${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    },
  )
}


// ==================================================
// Task filtering and pagination
// ==================================================

export interface TaskFilters {
  status?: BackendTaskStatus
  source?: "email" | "document" | "manual"
  deadline?: string
  requires_payment?: boolean
  page?: number
  page_size?: number
}


export interface PaginatedTasks {
  tasks: Task[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}


function buildTaskQuery(filters: TaskFilters): string {
  const parameters = new URLSearchParams()

  if (filters.status !== undefined) {
    parameters.set("status", filters.status)
  }

  if (filters.source !== undefined) {
    parameters.set("source", filters.source)
  }

  if (filters.deadline !== undefined) {
    parameters.set("deadline", filters.deadline)
  }

  if (filters.requires_payment !== undefined) {
    parameters.set(
      "requires_payment",
      String(filters.requires_payment),
    )
  }

  if (filters.page !== undefined) {
    parameters.set("page", String(filters.page))
  }

  if (filters.page_size !== undefined) {
    parameters.set(
      "page_size",
      String(filters.page_size),
    )
  }

  return parameters.toString()
}


// ==================================================
// Task API
// ==================================================

export async function getTasks(
  filters: TaskFilters = {},
): Promise<Task[]> {
  const query = buildTaskQuery(filters)

  return request<Task[]>(
    query ? `/tasks/?${query}` : "/tasks/",
  )
}


export async function getPaginatedTasks(
  filters: TaskFilters = {},
): Promise<PaginatedTasks> {
  const query = buildTaskQuery(filters)
  const token = getAccessToken()
  const organizationId = getCurrentOrganizationId()

  const headers = new Headers()

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  if (organizationId) {
    headers.set("X-Organization-ID", organizationId)
  }

  let response: Response

  try {
    response = await fetch(
      `${API_URL}${query ? `/tasks/?${query}` : "/tasks/"}`,
      {
        headers,
      },
    )
  } catch {
    throw new ApiError(
      "Unable to connect to the Clerkly backend.",
      0,
    )
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken()
    }

    throw new ApiError(
      `Unable to load tasks: ${response.status}`,
      response.status,
    )
  }

  const tasks = (await response.json()) as Task[]

  return {
    tasks,
    totalCount: Number(
      response.headers.get("X-Total-Count") ?? tasks.length,
    ),
    totalPages: Number(
      response.headers.get("X-Total-Pages") ?? 1,
    ),
    currentPage: Number(
      response.headers.get("X-Current-Page") ??
        filters.page ??
        1,
    ),
    pageSize: Number(
      response.headers.get("X-Page-Size") ??
        filters.page_size ??
        20,
    ),
  }
}


export async function getTask(
  taskId: string,
): Promise<Task> {
  return request<Task>(
    `/tasks/${encodeURIComponent(taskId)}`,
  )
}


export async function createTask(
  task: Task,
): Promise<Task> {
  return request<Task>("/tasks/", {
    method: "POST",
    body: JSON.stringify(task),
  })
}


export async function getApprovals(): Promise<Task[]> {
  return request<Task[]>("/tasks/approvals")
}


export async function approveRequest(
  taskId: string,
): Promise<Task> {
  return request<Task>(
    `/tasks/${encodeURIComponent(taskId)}/approve`,
    {
      method: "POST",
    },
  )
}


export async function rejectRequest(
  taskId: string,
): Promise<Task> {
  return request<Task>(
    `/tasks/${encodeURIComponent(taskId)}/reject`,
    {
      method: "POST",
    },
  )
}


export async function executeTask(
  taskId: string,
): Promise<Task> {
  return request<Task>(
    `/tasks/${encodeURIComponent(taskId)}/execute`,
    {
      method: "POST",
    },
  )
}


export async function createCheckoutSession(
  taskId: string,
): Promise<CheckoutSession> {
  return request<CheckoutSession>(
    (
      `/tasks/${encodeURIComponent(taskId)}` +
      "/checkout-session"
    ),
    {
      method: "POST",
    },
  )
}

export async function getTaskHistory(
  taskId: string,
): Promise<TaskEvent[]> {
  return request<TaskEvent[]>(
    `/tasks/${encodeURIComponent(taskId)}/history`,
  )
}


// ==================================================
// Compatibility function for existing task UI
// ==================================================

export async function updateTaskStatus(
  taskId: string,
  status: BackendTaskStatus | string,
): Promise<Task> {
  switch (status) {
    case "approved":
      return approveRequest(taskId)

    case "rejected":
      return rejectRequest(taskId)

    case "in_progress":
    case "completed":
      return executeTask(taskId)

    default:
      throw new ApiError(
        `The backend does not allow directly changing a task to "${status}".`,
        400,
      )
  }
}


// ==================================================
// Document intake API
// ==================================================

export async function uploadDocument(
  file: File,
): Promise<Task> {
  const formData = new FormData()

  formData.append("document", file)

  return request<Task>("/intake/document", {
    method: "POST",
    body: formData,
  })
}


// ==================================================
// Email intake API (Gmail)
// ==================================================

export interface AuthorizationUrl {
  authorization_url: string
}


export async function connectGmail(): Promise<
  AuthorizationUrl
> {
  return request<AuthorizationUrl>(
    "/intake/email/connect",
  )
}


export async function syncGmailEmails(): Promise<Task[]> {
  return request<Task[]>("/intake/email/sync", {
    method: "POST",
  })
}


// ==================================================
// Signature intake API (DocuSign sandbox)
// ==================================================

export async function connectDocuSign(): Promise<
  AuthorizationUrl
> {
  return request<AuthorizationUrl>(
    "/intake/signature/connect",
  )
}


export async function sendTaskForSignature(
  taskId: string,
): Promise<Task> {
  return request<Task>(
    `/intake/signature/tasks/${encodeURIComponent(
      taskId,
    )}/send`,
    {
      method: "POST",
    },
  )
}


// ==================================================
// Activity derived from real audit events
// ==================================================

function formatEventTitle(eventType: string): string {
  const titles: Record<string, string> = {
    task_created: "Task Created",
    task_approved: "Task Approved",
    task_rejected: "Task Rejected",
    execution_started: "Execution Started",
    execution_completed: "Task Completed",
    execution_failed: "Execution Failed",
  }

  return titles[eventType] ?? "Task Updated"
}


function mapEventToActivityType(
  eventType: string,
): Activity["type"] {
  switch (eventType) {
    case "task_created":
      return "task_created"

    case "task_approved":
      return "payment_approved"

    case "execution_completed":
      return "task_completed"

    case "execution_failed":
      return "approval_requested"

    default:
      return "approval_requested"
  }
}


function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  return date.toLocaleString()
}


export async function getActivity(): Promise<Activity[]> {
  const tasks = await getTasks({
    page: 1,
    page_size: 100,
  })

  const histories = await Promise.all(
    tasks.map(async (task) => {
      try {
        const events = await getTaskHistory(task.task_id)

        return events.map((event) => ({
          task,
          event,
        }))
      } catch {
        return []
      }
    }),
  )

  return histories
    .flat()
    .sort((left, right) => {
      return (
        new Date(right.event.created_at).getTime() -
        new Date(left.event.created_at).getTime()
      )
    })
    .map(({ task, event }) => ({
      activity_id: String(event.event_id),
      title: formatEventTitle(event.event_type),
      description:
        event.message ??
        `${task.title}: ${event.event_type.replaceAll("_", " ")}`,
      timestamp: formatTimestamp(event.created_at),
      type: mapEventToActivityType(event.event_type),
    }))
}


// ==================================================
// Notifications derived from real backend events
// ==================================================

function mapActivityToNotificationType(
  activity: Activity,
): Notification["type"] {
  switch (activity.type) {
    case "task_completed":
    case "payment_approved":
      return "success"

    case "approval_requested":
      return "warning"

    case "document_uploaded":
    case "task_created":
    default:
      return "info"
  }
}


export async function getNotifications(): Promise<
  Notification[]
> {
  const activities = await getActivity()

  return activities.slice(0, 10).map((activity) => ({
    notification_id: `notification-${activity.activity_id}`,
    title: activity.title,
    description: activity.description,
    timestamp: activity.timestamp,
    is_read: false,
    type: mapActivityToNotificationType(activity),
  }))
}