import sys
import re

with open('src/components/dashboard/EditTaskModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('NewTaskModal', 'EditTaskModal')
content = content.replace('Create New Task', 'Edit Task')
content = content.replace('Create Task', 'Save Changes')
content = content.replace('Task Created!', 'Task Updated!')
content = content.replace('Your new task has been added successfully.', 'Your task has been updated successfully.')

# We need to accept initialData
target_interface = """interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}"""

replacement_interface = """interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: any
}"""
content = content.replace(target_interface, replacement_interface)

target_args = "export function EditTaskModal({ isOpen, onClose, onSuccess }: EditTaskModalProps) {"
replacement_args = "export function EditTaskModal({ isOpen, onClose, onSuccess, initialData }: EditTaskModalProps) {"
content = content.replace(target_args, replacement_args)

target_state = """  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    deadline: "",
    document_type: "",
    requires_signature: false,
    requires_payment: false,
    amount: ""
  })"""

replacement_state = """  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: (initialData?.priority || "medium") as TaskPriority,
    deadline: initialData?.deadline ? initialData.deadline.split('T')[0] : "",
    document_type: initialData?.document_type || "",
    requires_signature: initialData?.requires_signature || false,
    requires_payment: initialData?.requires_payment || false,
    amount: initialData?.amount || ""
  })"""

content = content.replace(target_state, replacement_state)

with open('src/components/dashboard/EditTaskModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Created EditTaskModal")
