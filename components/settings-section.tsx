import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Trash2, Download, Shield } from "lucide-react"

export function SettingsSection() {
  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Study Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded to study</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="border-t border-border pt-4"></div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Quiz Recommendations</Label>
              <p className="text-sm text-muted-foreground">Receive quiz suggestions</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="border-t border-border pt-4"></div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive weekly reports</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start rounded-lg h-11 bg-transparent">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start rounded-lg h-11 bg-transparent">
            Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full justify-start rounded-lg h-11 bg-transparent">
            Connected Devices
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-secondary" />
            Data Management
          </CardTitle>
          <CardDescription>Download or delete your study data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-medium mb-2 block">Export Your Data</Label>
            <Button variant="outline" className="w-full justify-center rounded-lg h-10 gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Download All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Download all your notes, quizzes, and progress data</p>
          </div>
          <div className="border-t border-border pt-4">
            <Label className="font-medium mb-2 block">Delete Uploaded Notes</Label>
            <Button
              variant="outline"
              className="w-full justify-center rounded-lg h-10 text-red-600 hover:bg-red-50 bg-transparent"
            >
              Clear All Notes
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Permanently delete all your uploaded study materials</p>
          </div>
        </CardContent>
      </Card>

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
          <Button
            variant="outline"
            className="w-full justify-center rounded-lg h-10 border-red-200 hover:bg-red-100 text-red-600 bg-transparent"
          >
            Delete Account
          </Button>
          <p className="text-xs text-red-600 mt-2">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
