import sys

with open('src/components/layout/Header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """</AnimatePresence>
        </div>
      </div>
    </header>"""

replacement = """</AnimatePresence>
        </div>

        <div className="relative hidden sm:block ml-2">
          <a href="/settings" className="w-9 h-9 rounded-full overflow-hidden border border-border/60 hover:border-primary/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
             AJ
          </a>
        </div>
      </div>
    </header>"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/layout/Header.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Header updated")
else:
    print("Target not found in Header.tsx")
