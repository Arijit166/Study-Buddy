import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Mail, Calendar, User } from "lucide-react"

interface ProfileHeaderProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  memberSince?: string;
}

export function ProfileHeader({ 
  userName = "John Doe",
  userEmail = "john.doe@email.com",
  userAvatar,
  memberSince = "Nov 2024"
}: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(userName)}</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-accent hover:bg-accent/90 transition-colors shadow-md">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-foreground">{userName}</h2>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {userEmail}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Member since</p>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {memberSince}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Study streak</p>
                <p className="font-semibold text-foreground">7 days</p>
              </div>
            </div>
          </div>

          {/* Action */}
          <Button className="mt-2 rounded-lg h-10 bg-primary hover:bg-primary/90">Edit Profile</Button>
        </div>
      </CardContent>
    </Card>
  )
}
