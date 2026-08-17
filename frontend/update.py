import sys

def update_file(filename, replacements):
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

replacements = [
    ('className="p-5 hover:bg-muted/50 transition-colors group cursor-pointer relative"', 
     'className="p-5 hover:bg-muted/40 transition-all duration-200 active:scale-[0.99] group cursor-pointer relative focus-visible:outline-none focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"'),
    ('className="font-medium text-foreground group-hover:text-primary transition-colors text-sm"',
     'className="font-medium text-foreground group-hover:text-primary transition-all duration-200 group-hover:translate-x-0.5 text-sm"')
]

update_file('src/components/dashboard/UpcomingDeadlines.tsx', replacements)
