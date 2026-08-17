import sys

with open('src/app/tasks/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """            <option value="high">High</option>
          </select>"""

replacement = """            <option value="high">High</option>
          </select>
          
          <button className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center whitespace-nowrap">
            + New Task
          </button>"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/app/tasks/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added new task button")
else:
    print("Target not found")
