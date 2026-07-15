import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addFavorite } from "@/lib/repositories/favoriteRepository";
import { findMovieById } from "@/lib/repositories/movieRepository";

type AddFavoriteRequest = {
  movieId?: unknown;
};

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to favorite a movie." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as AddFavoriteRequest;
    const movieId = Number(body.movieId);

    if (!Number.isInteger(movieId)) {
      return NextResponse.json(
        { error: "Invalid movie id." },
        { status: 400 },
      );
    }

    const movie = await findMovieById(movieId);

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found." },
        { status: 404 },
      );
    }

    await addFavorite(session.userId, movieId);

    return NextResponse.json(
      { message: "Added to favorites." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add favorite error:", error);

    return NextResponse.json(
      { error: "Could not add movie to favorites. Please try again." },
      { status: 500 },
    );
  }
}
