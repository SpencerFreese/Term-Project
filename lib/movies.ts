import "server-only";

import { type RowDataPacket } from "mysql2/promise";

import { query } from "@/lib/db";

export type MovieStatus = "currently_playing" | "coming_soon";

export type Movie = {
  movieId: number;
  title: string;
  description: string | null;
  mpaaRating: string | null;
  runtimeMinutes: number | null;
  releaseDate: string | null;
};

type MovieRow = RowDataPacket & {
  movieId: number;
  title: string;
  description: string | null;
  mpaaRating: string | null;
  runtimeMinutes: number | null;
  releaseDate: string | null;
};

async function getMoviesByStatus(status: MovieStatus) {
  return query<MovieRow>(
    `
      SELECT
        movie_id AS movieId,
        title,
        description,
        mpaa_rating AS mpaaRating,
        runtime_minutes AS runtimeMinutes,
        DATE_FORMAT(release_date, '%Y-%m-%d') AS releaseDate
      FROM movies
      WHERE status = ?
      ORDER BY release_date ASC, title ASC
    `,
    [status],
  );
}

export async function getCurrentlyPlayingMovies(): Promise<Movie[]> {
  return getMoviesByStatus("currently_playing");
}

export async function getComingSoonMovies(): Promise<Movie[]> {
  return getMoviesByStatus("coming_soon");
}
