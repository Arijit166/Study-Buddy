"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, BookOpen, MessageSquare, Lightbulb, BarChart3, User, LogOut, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Notes", href: "/notes" },
  { icon: MessageSquare, label: "AI Chat", href: "/chat", dynamic: true },
  { icon: Lightbulb, label: "Flashcards", href: "/flashcards" },
  { icon: Calendar, label: "Study Plan", href: "/study-plan" }, // New item
  { icon: BarChart3, label: "Quizzes", href: "/quizzes" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = async () => {
    setShowLogoutDialog(false)
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleNavClick = async (item: typeof navItems[0]) => {
    if (item.label === "AI Chat") {
      const currentNoteId = pathname.match(/\/chat\/([a-zA-Z0-9]+)/)?.[1]
      
      if (currentNoteId) {
        return
      }
      
      try {
        const res = await fetch('/api/chat/last')
        const data = await res.json()
        
        if (data.noteId) {
          router.push(`/chat/${data.noteId}?t=${Date.now()}`)
        } else {
          router.push('/notes')
        }
      } catch (error) {
        router.push('/notes')
      }
    }
  }

  return (
    <>
      <aside className="w-64 h-screen bg-gradient-to-b from-sidebar to-sidebar/80 border-r border-sidebar-border/50 flex flex-col backdrop-blur-sm shadow-2xl">
        <div className="px-6 py-8 border-b border-sidebar-border/30 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/50 flex items-center justify-center">
              <span className="text-lg font-bold text-white">🎓</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">Study Buddy</h1>
              <p className="text-xs text-muted-foreground/70">AI Learning</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.dynamic
              ? pathname.startsWith('/chat')
              : pathname === item.href

            if (item.dynamic) {
              return (
                <Button
                  key={item.href}
                  onClick={() => handleNavClick(item)}
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
              )
            }

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

        <div className="px-3 py-4 border-t border-sidebar-border">
          <Button
            onClick={() => setShowLogoutDialog(true)}
            disabled={isLoggingOut}
            variant="outline"
            className="w-full justify-start gap-3 h-10 rounded-lg bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </aside>

      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">Confirm Logout</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to logout? You will be redirected to the login page.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="px-4 bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}