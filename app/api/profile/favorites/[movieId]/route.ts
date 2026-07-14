import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { removeFavorite } from "@/lib/repositories/favoriteRepository";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ movieId: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to update favorites." },
        { status: 401 },
      );
    }

    const { movieId } = await params;
    const movieIdNumber = Number(movieId);

    if (!Number.isInteger(movieIdNumber)) {
      return NextResponse.json(
        { error: "Invalid movie id." },
        { status: 400 },
      );
    }

    await removeFavorite(session.userId, movieIdNumber);

    return NextResponse.json({ message: "Removed from favorites." });
  } catch (error) {
    console.error("Remove favorite error:", error);

    return NextResponse.json(
      { error: "Could not remove movie from favorites. Please try again." },
      { status: 500 },
    );
  }
}
