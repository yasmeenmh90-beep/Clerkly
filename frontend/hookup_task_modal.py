import sys
import re

with open('src/app/tasks/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'import { NewTaskModal }' not in content:
    content = content.replace('import { TaskModal } from "@/components/dashboard/TaskModal"', 'import { TaskModal } from "@/components/dashboard/TaskModal"\nimport { NewTaskModal } from "@/components/dashboard/NewTaskModal"')

# Add state
if 'const [isNewTaskModalOpen, setIsNewTaskModalOpen]' not in content:
    content = content.replace('const [isUpdating, setIsUpdating] = useState(false)', 'const [isUpdating, setIsUpdating] = useState(false)\n  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)')

# Hook up button
content = content.replace("""<button className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center whitespace-nowrap">
            + New Task
          </button>""", """<button 
            onClick={() => setIsNewTaskModalOpen(true)}
            className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center whitespace-nowrap"
          >
            + New Task
          </button>""")

# Add modal to end of file
modal_jsx = """      <AnimatePresence>
        {isNewTaskModalOpen && (
          <NewTaskModal 
            isOpen={isNewTaskModalOpen}
            onClose={() => setIsNewTaskModalOpen(false)}
            onSuccess={() => setIsNewTaskModalOpen(false)}
          />
        )}
      </AnimatePresence>"""

if 'isNewTaskModalOpen && (' not in content:
    content = content.replace('</AnimatePresence>\n    </div>', '</AnimatePresence>\n' + modal_jsx + '\n    </div>')

with open('src/app/tasks/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Hooked up NewTaskModal")
