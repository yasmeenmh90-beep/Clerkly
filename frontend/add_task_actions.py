import sys

with open('src/components/dashboard/TaskModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """            <button 
              onClick={onClose}
              disabled={isUpdating}
              className="px-6 h-10 border border-border hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            >
              Close
            </button>"""

replacement = """            <button 
              onClick={() => confirm("Are you sure you want to delete this task?") && onClose()}
              disabled={isUpdating}
              className="px-6 h-10 border border-danger/30 text-danger hover:bg-danger/10 rounded-lg font-medium text-sm transition-colors flex items-center justify-center ml-auto"
            >
              Delete
            </button>
            <button 
              onClick={() => alert("Edit task functionality coming soon")}
              disabled={isUpdating}
              className="px-6 h-10 border border-border hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            >
              Edit
            </button>
            <button 
              onClick={onClose}
              disabled={isUpdating}
              className="px-6 h-10 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            >
              Close
            </button>"""

# Using python's replace
if target in content:
    content = content.replace(target, replacement)
    with open('src/components/dashboard/TaskModal.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added delete and edit buttons")
else:
    # Try finding an alternate target
    target2 = 'className="px-6 h-10 border border-border hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors flex'
    import re
    if re.search(r'<button[^>]*onClick=\{onClose\}[^>]*>[\s]*Close[\s]*</button>', content):
       print("Need regex replacement")
    else:
       print("Target not found at all")
