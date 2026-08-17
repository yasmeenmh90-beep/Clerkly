import sys

with open('src/lib/api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target_approve = """export async function approveRequest(approvalId: string): Promise<boolean> {
  if (!API_BASE_URL) {
    await delay(500);
    return true;
  }"""
  
replacement_approve = """export async function approveRequest(approvalId: string): Promise<boolean> {
  if (!API_BASE_URL) {
    await delay(500);
    // approvalId looks like "app-task-1", extract task id:
    const taskId = approvalId.replace("app-", "");
    const taskIndex = mockTasks.findIndex((t) => t.task_id === taskId);
    if (taskIndex !== -1) {
      mockTasks[taskIndex].status = "in_progress";
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('task-updated'));
    }
    return true;
  }"""

target_reject = """export async function rejectRequest(approvalId: string): Promise<boolean> {
  if (!API_BASE_URL) {
    await delay(500);
    return true;
  }"""

replacement_reject = """export async function rejectRequest(approvalId: string): Promise<boolean> {
  if (!API_BASE_URL) {
    await delay(500);
    const taskId = approvalId.replace("app-", "");
    const taskIndex = mockTasks.findIndex((t) => t.task_id === taskId);
    if (taskIndex !== -1) {
      mockTasks[taskIndex].status = "pending";
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('task-updated'));
    }
    return true;
  }"""

content = content.replace(target_approve, replacement_approve)
content = content.replace(target_reject, replacement_reject)

with open('src/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated mock state mutations in API")
