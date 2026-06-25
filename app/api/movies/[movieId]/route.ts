import { NextResponse } from "next/server";
import { getMovieDetails } from "@/lib/services/movieService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ movieId: string }> },
) {
  const { movieId } = await params;
  const movie = await getMovieDetails(Number(movieId));

  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  return NextResponse.json({ movie });
}