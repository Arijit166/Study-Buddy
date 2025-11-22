"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, BookOpen, MessageSquare, Lightbulb, BarChart3, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Notes", href: "/notes" },
  { icon: MessageSquare, label: "AI Chat", href: "/chat" },
  { icon: Lightbulb, label: "Flashcards", href: "/flashcards" },
  { icon: BarChart3, label: "Quizzes", href: "/quizzes" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Redirect to login page
        router.push('/')
        router.refresh() // Force a refresh to clear any cached data
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
            <span className="text-lg font-bold text-white">🎓</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg">Study Buddy</h1>
            <p className="text-xs text-muted-foreground">AI Learning</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-base gap-3 px-4 py-2 h-11 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <Button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="outline" 
          className="w-full justify-start gap-3 h-10 rounded-lg bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          <LogOut className="w-4 h-4" />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </Button>
      </div>
    </aside>
  )
}