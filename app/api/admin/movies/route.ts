import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { insertMovie } from "@/lib/repositories/movieRepository";

async function fetchTmdbPoster(title: string): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=en-US&page=1`,
    );

    if (!res.ok) return null;

    const data = await res.json();
    const posterPath = data.results?.[0]?.poster_path;

    if (!posterPath) return null;

    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    title,
    description,
    posterUrl,
    trailerUrl,
    mpaaRating,
    castList,
    runtimeMinutes,
    releaseDate,
    status,
    genreIds,
  } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (!status || !["currently_playing", "coming_soon"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (runtimeMinutes !== null && runtimeMinutes !== undefined) {
    const parsed = Number(runtimeMinutes);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return NextResponse.json(
        { error: "Runtime must be a positive whole number." },
        { status: 400 },
      );
    }
  }

  if (releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
    return NextResponse.json(
      { error: "Invalid release date format." },
      { status: 400 },
    );
  }

  // Use manually entered poster URL if provided, otherwise fetch from TMDB
  const resolvedPosterUrl =
    posterUrl?.trim() || (await fetchTmdbPoster(title.trim()));

  const movieId = await insertMovie({
    title: title.trim(),
    description: description?.trim() || null,
    posterUrl: resolvedPosterUrl,
    trailerUrl: trailerUrl?.trim() || null,
    mpaaRating: mpaaRating?.trim() || null,
    castList: castList?.trim() || null,
    runtimeMinutes: runtimeMinutes ? Number(runtimeMinutes) : null,
    releaseDate: releaseDate || null,
    status,
    genreIds: Array.isArray(genreIds) ? genreIds.map(Number) : [],
  });

  return NextResponse.json({ movieId }, { status: 201 });
}