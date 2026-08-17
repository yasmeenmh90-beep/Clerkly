import sys

with open('src/app/login/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<a href="#" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>',
    '<a href="/forgot-password" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>'
)

with open('src/app/login/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated login links")
