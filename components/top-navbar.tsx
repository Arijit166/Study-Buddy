"use client"

import { Bell, Settings, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function TopNavbar({ title }: { title: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-muted">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full w-10 h-10 hover:bg-muted"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-muted">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-sm font-bold text-white">JD</span>
        </div>
      </div>
    </header>
  )
}
