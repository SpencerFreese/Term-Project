import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { execute, query } from "@/lib/db";

export type FavoriteMovieRow = RowDataPacket & {
  movieId: number;
  title: string;
  posterUrl: string | null;
  mpaaRating: string | null;
  runtimeMinutes: number | null;
};

export async function findFavoriteMovieIdsByUserId(userId: number) {
  const rows = await query<RowDataPacket & { movieId: number }>(
    `
      SELECT movie_id AS movieId
      FROM favorite_movies
      WHERE user_id = ?
    `,
    [userId],
  );

  return rows.map((row) => row.movieId);
}

export async function findFavoriteMoviesByUserId(userId: number) {
  return query<FavoriteMovieRow>(
    `
      SELECT
        m.movie_id AS movieId,
        m.title,
        m.poster_url AS posterUrl,
        m.mpaa_rating AS mpaaRating,
        m.runtime_minutes AS runtimeMinutes
      FROM favorite_movies f
      JOIN movies m ON m.movie_id = f.movie_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `,
    [userId],
  );
}

export async function addFavorite(userId: number, movieId: number) {
  await execute(
    `
      INSERT IGNORE INTO favorite_movies (user_id, movie_id)
      VALUES (?, ?)
    `,
    [userId, movieId],
  );
}

export async function removeFavorite(userId: number, movieId: number) {
  await execute(
    `
      DELETE FROM favorite_movies
      WHERE user_id = ?
        AND movie_id = ?
    `,
    [userId, movieId],
  );
}
