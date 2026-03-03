import sys

file_path = "nimbusu-frontend/components/application/calendar.tsx"

with open(file_path, "r") as f:
    content = f.read()

replacements = {
    # Backgrounds
    "bg-[#111111]": "bg-card",
    "bg-[#161616]": "bg-muted/50",
    "bg-[#0a0a0a]": "bg-background",
    "bg-[#141414]": "bg-card",
    "hover:bg-[#1a1a1a]": "hover:bg-accent",
    "hover:bg-[#222]": "hover:bg-accent",
    
    # Zinc backgrounds
    "bg-zinc-900/80": "bg-accent/50",
    "bg-zinc-900/30": "bg-muted/30",
    "bg-zinc-900": "bg-popover",
    "hover:bg-zinc-800/50": "hover:bg-accent",
    "hover:bg-zinc-800/20": "hover:bg-accent/50",
    "focus:bg-zinc-800": "focus:bg-accent",
    "bg-zinc-800/60": "bg-border",
    "bg-zinc-800": "bg-border",
    
    "bg-zinc-200": "bg-primary",

    # Borders
    "border-zinc-800/80": "border-border",
    "border-zinc-800/60": "border-border",
    "border-zinc-800/40": "border-border/50",
    "border-zinc-800": "border-border",
    "hover:border-zinc-700": "hover:border-accent-foreground/20",
    "hover:border-zinc-600": "hover:border-accent-foreground/50",
    
    # Texts
    "text-zinc-100": "text-foreground",
    "text-zinc-200": "text-foreground",
    "text-zinc-300": "text-foreground/90",
    "text-zinc-400": "text-muted-foreground",
    "text-zinc-500": "text-muted-foreground",
    "text-zinc-600": "text-muted-foreground/70",
    "text-zinc-900": "text-primary-foreground",
    "placeholder:text-zinc-600": "placeholder:text-muted-foreground",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, "w") as f:
    f.write(content)
