import { NextResponse } from "next/server";
import { getMovieSearchResults } from "@/lib/services/movieService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") ?? undefined;
  const genres = searchParams.getAll("genre");
  const showDate = searchParams.get("showDate") ?? undefined;

  const movies = await getMovieSearchResults(search, genres, showDate);

  return NextResponse.json({ movies });
}