// src/components/theme-toggle.jsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-terminal-card border border-terminal-border hover:bg-terminal-border/50 transition-colors">
        <div className="h-4 w-4 lg:h-5 lg:w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-terminal-card border border-terminal-border hover:bg-terminal-border/50 transition-colors hover:border-terminal-blue/50 button-glow"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 lg:h-5 lg:w-5 text-terminal-yellow" />
      ) : (
        <Moon className="h-4 w-4 lg:h-5 lg:w-5 text-terminal-blue" />
      )}
    </button>
  )
}