import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SettingsSection() {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account deleted successfully');
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        toast.error(data.error || 'Failed to delete account');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Danger Zone */}
      <Card className="border-0 shadow-md border border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-center rounded-lg h-10 border-red-200 hover:bg-red-100 text-red-600 bg-transparent"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p className="font-semibold">This action cannot be undone.</p>
                  <p>This will permanently delete your account and remove all your data from our servers including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Your profile information</li>
                    <li>All uploaded notes and documents</li>
                    <li>Quiz history and statistics</li>
                    <li>Study progress and streaks</li>
                  </ul>
                  <p className="text-red-600 font-medium mt-4">
                    You will not be able to log in again with this email address.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs text-red-600 mt-2">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}