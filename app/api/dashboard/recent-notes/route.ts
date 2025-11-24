import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recentNotes = await Note.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("_id name fileName fileType fileSize createdAt")
      .lean();

    const notesWithDetails = recentNotes.map((note) => ({
      _id: note._id.toString(),
      name: note.name,
      fileName: note.fileName,
      fileType: note.fileType,
      fileSize: note.fileSize,
      createdAt: note.createdAt.toISOString(),
    }));

    return NextResponse.json({ notes: notesWithDetails });
  } catch (error) {
    console.error("Fetch recent notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent notes" },
      { status: 500 }
    );
  }
}