import { Card, CardContent } from "@/components/ui/card"
import { Camera, Mail, Calendar, X, Check, Pencil } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
interface ProfileHeaderProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  createdAt?: Date | string;
  onUpdateProfile?: (name: string, avatar: string | null) => void;
}

export function ProfileHeader({ 
  userName,
  userEmail,
  userAvatar,
  createdAt,
  onUpdateProfile
}: ProfileHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userName || "");
  const [currentAvatar, setCurrentAvatar] = useState(userAvatar);
  useEffect(() => {
      setEditedName(userName || "");
    }, [userName]);

    useEffect(() => {
      setCurrentAvatar(userAvatar);
    }, [userAvatar]);
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  const getMemberSince = () => {
    if (!createdAt) return "Recently";
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateProfile?.(editedName, currentAvatar || null);
      setIsEditingName(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const { url } = await response.json();
          setCurrentAvatar(url);
          onUpdateProfile?.(userName || "", url);
        }
      } catch (error) {
        console.error('Avatar upload failed:', error);
      }
    }
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setCurrentAvatar(undefined);
    // Use userName consistently
    onUpdateProfile?.(userName || "", null);
  };

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden">
              {currentAvatar ? (
                <img 
                  src={currentAvatar} 
                  alt={editedName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(editedName)}</span>
              )}
            </div>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-accent hover:bg-accent/90 transition-colors shadow-md cursor-pointer"
            >
              <Camera className="w-4 h-4 text-white" />
            </label>
            {currentAvatar && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute top-0 right-0 p-1.5 rounded-full bg-destructive hover:bg-destructive/90 transition-colors shadow-md opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-3xl font-bold h-12 max-w-md"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-white"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setEditedName(userName || "");
                    setIsEditingName(false);
                  }}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-foreground">{editedName || "User"}</h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}
            {userEmail && (
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {userEmail}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Member since</p>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {getMemberSince() || "Recently"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Study streak</p>
                <p className="font-semibold text-foreground">7 days</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}