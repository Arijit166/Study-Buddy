"use client"
import { User } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

interface TopNavbarProps {
  title: string;
  userName?: string;
  userAvatar?: string; // Google avatar or undefined
}

export function TopNavbar({ title, userName, userAvatar }: TopNavbarProps) {
  const { theme, setTheme } = useTheme()
  const [imgError, setImgError] = useState(false)

  return (
    <header className="h-16 bg-gradient-to-r from-card via-card/90 to-card/80 border-b border-border/50 flex items-center justify-between px-8 shadow-lg shadow-primary/5 backdrop-blur-sm">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">{title}</h2>

      <div className="flex items-center gap-4">

        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary/80 
                        flex items-center justify-center cursor-pointer hover:opacity-90 hover:shadow-lg hover:shadow-accent/50
                        transition-all overflow-hidden shadow-md border border-accent/30">

          {/* GOOGLE AVATAR → only show if image exists & doesn’t error */}
          {userAvatar && !imgError ? (
            <img
              src={userAvatar}
              alt={userName || "User"}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)} // fallback to icon
            />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
      </div>
    </header>
  )
}
