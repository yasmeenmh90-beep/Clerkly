import sys

with open('src/app/tasks/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'import { EditTaskModal }' not in content:
    content = content.replace('import { NewTaskModal } from "@/components/dashboard/NewTaskModal"', 'import { NewTaskModal } from "@/components/dashboard/NewTaskModal"\nimport { EditTaskModal } from "@/components/dashboard/EditTaskModal"')

# Add state
if 'const [isEditTaskModalOpen, setIsEditTaskModalOpen]' not in content:
    content = content.replace('const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)', 'const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)\n  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)')

# Hook up Edit button
target_button = """<button 
                  onClick={() => alert("Edit task functionality coming soon")}
                  className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors active:scale-95"
                >
                  Edit
                </button>"""
replacement_button = """<button 
                  onClick={() => setIsEditTaskModalOpen(true)}
                  className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors active:scale-95"
                >
                  Edit
                </button>"""
content = content.replace(target_button, replacement_button)

# Add Edit modal
target_jsx = """      <AnimatePresence>
        {isNewTaskModalOpen && ("""
replacement_jsx = """      <AnimatePresence>
        {isEditTaskModalOpen && selectedTask && (
          <EditTaskModal 
            isOpen={isEditTaskModalOpen}
            onClose={() => setIsEditTaskModalOpen(false)}
            onSuccess={() => setIsEditTaskModalOpen(false)}
            initialData={selectedTask}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isNewTaskModalOpen && ("""
content = content.replace(target_jsx, replacement_jsx)

with open('src/app/tasks/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Hooked up EditTaskModal")
