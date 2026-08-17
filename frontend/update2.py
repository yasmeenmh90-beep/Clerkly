import sys

def replace_in_file(filename, replacements):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        for old, new in replacements:
            content = content.replace(old, new)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
    except Exception as e:
        print(f"Error {filename}: {e}")

replacements_task_modal = [
    ('className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col"',
     'className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col"'),
    ('className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"',
     'className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all duration-200 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"'),
    ('className="w-full py-2.5 rounded-lg font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"',
     'className="w-full py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"'),
    ('className="w-full py-2.5 rounded-lg font-medium transition-colors border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center gap-2"',
     'className="w-full py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"')
]

replace_in_file('src/components/dashboard/TaskModal.tsx', replacements_task_modal)

replacements_sidebar = [
    ('className="p-2 rounded-md bg-card border border-border text-foreground shadow-sm"',
     'className="p-2 rounded-md bg-card border border-border/60 text-foreground shadow-sm transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"'),
    ('className={cn(\n                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",\n                  isActive\n                    ? "bg-primary/10 text-primary"\n                    : "text-muted-foreground hover:bg-muted hover:text-foreground"\n                )}',
     'className={cn(\n                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",\n                  isActive\n                    ? "bg-primary text-primary-foreground shadow-sm"\n                    : "text-muted-foreground hover:bg-muted hover:text-foreground"\n                )}')
]

replace_in_file('src/components/layout/Sidebar.tsx', replacements_sidebar)

replacements_header = [
    ('className="px-4 py-2 bg-transparent border-none focus:outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"',
     'className="px-4 py-2 bg-transparent border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-md text-sm w-full text-foreground placeholder:text-muted-foreground"'),
    ('className="w-8 h-8 rounded-full overflow-hidden border border-border"',
     'className="w-8 h-8 rounded-full overflow-hidden border border-border/60 hover:border-primary/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"')
]

replace_in_file('src/components/layout/Header.tsx', replacements_header)

print("Done")
