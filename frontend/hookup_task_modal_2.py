import sys

with open('src/app/tasks/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import if missing
if 'import { NewTaskModal }' not in content:
    content = content.replace('import { getTasks, updateTaskStatus } from "@/lib/api"', 'import { getTasks, updateTaskStatus } from "@/lib/api"\nimport { NewTaskModal } from "@/components/dashboard/NewTaskModal"')

if 'isNewTaskModalOpen && (' not in content:
    # Find the end of the file which is </div>\n  )\n}
    content = content.replace('  )\n}', '      <AnimatePresence>\n        {isNewTaskModalOpen && (\n          <NewTaskModal \n            isOpen={isNewTaskModalOpen}\n            onClose={() => setIsNewTaskModalOpen(false)}\n            onSuccess={() => { setIsNewTaskModalOpen(false); }}\n          />\n        )}\n      </AnimatePresence>\n    </div>\n  )\n}')

with open('src/app/tasks/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Properly hooked up NewTaskModal")
