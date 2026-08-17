import sys

with open('src/app/tasks/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}"""

replacement = """                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => confirm("Are you sure you want to delete this task?") && setSelectedTask(null)}
                  className="px-4 py-2 border border-danger/30 text-danger hover:bg-danger/10 rounded-lg font-medium text-sm transition-colors mr-auto active:scale-95"
                >
                  Delete
                </button>
                <button 
                  onClick={() => alert("Edit task functionality coming soon")}
                  className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-lg font-medium text-sm transition-colors active:scale-95"
                >
                  Edit
                </button>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors shadow-sm active:scale-95"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/app/tasks/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added delete and edit to page modal")
else:
    print("Target not found")
