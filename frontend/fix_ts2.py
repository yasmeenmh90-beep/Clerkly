import sys

# Fix Documents Page
with open('src/app/documents/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('statusFilter === "all" || doc.status === statusFilter', 'statusFilter === "all" || (statusFilter === "failed" ? doc.status === "error" : doc.status === statusFilter)')
content = content.replace('doc.status === "failed"', 'doc.status === "error"')

with open('src/app/documents/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix Tasks Page
with open('src/app/tasks/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_lines = "  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)\n  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)\n  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)\n  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)"
good_lines = "  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)\n  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)"

content = content.replace(bad_lines, good_lines)

with open('src/app/tasks/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed TS errors")
