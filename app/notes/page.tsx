import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { FileUploadZone } from "@/components/file-upload-zone"
import { NotesLibrary } from "@/components/notes-library"

export default function NotesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar title="My Notes" />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <FileUploadZone />
            <NotesLibrary />
          </div>
        </main>
      </div>
    </div>
  )
}
