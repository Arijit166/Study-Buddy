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
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>

      <div className="flex items-center gap-4">

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80 
                        flex items-center justify-center cursor-pointer hover:opacity-80 
                        transition-opacity overflow-hidden">

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
