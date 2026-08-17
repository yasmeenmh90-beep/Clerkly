import sys

with open('src/components/layout/Header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('href="/settings"', 'href="/profile"')

with open('src/components/layout/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Header href updated")
