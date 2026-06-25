import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";

export type MovieStatus = "currently_playing" | "coming_soon";

export type Movie = {
  movieId: number;
  title: string;
  description: string | null;
  posterUrl: string | null;
  trailerUrl: string | null;
  mpaaRating: string | null;
  castList: string | null;
  runtimeMinutes: number | null;
  releaseDate: string | null;
  status: MovieStatus;
  genres: string | null;
};

type MovieRow = RowDataPacket & Movie;

const MOVIE_SELECT = `
  SELECT
    m.movie_id AS movieId,
    m.title,
    m.description,
    m.poster_url AS posterUrl,
    m.trailer_url AS trailerUrl,
    m.mpaa_rating AS mpaaRating,
    m.cast_list AS castList,
    m.runtime_minutes AS runtimeMinutes,
    DATE_FORMAT(m.release_date, '%Y-%m-%d') AS releaseDate,
    m.status,
    GROUP_CONCAT(g.name ORDER BY g.name SEPARATOR ', ') AS genres
  FROM movies m
  LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
  LEFT JOIN genres g ON mg.genre_id = g.genre_id
`;

export async function findMoviesByStatus(status: MovieStatus) {
  return query<MovieRow>(
    `
      ${MOVIE_SELECT}
      WHERE m.status = ?
      GROUP BY m.movie_id
      ORDER BY m.release_date ASC, m.title ASC
    `,
    [status],
  );
}

export async function findMovieById(movieId: number) {
  const rows = await query<MovieRow>(
    `
      ${MOVIE_SELECT}
      WHERE m.movie_id = ?
      GROUP BY m.movie_id
      LIMIT 1
    `,
    [movieId],
  );

  return rows[0] ?? null;
}

export async function searchMovies(searchTerm: string) {
  return query<MovieRow>(
    `
      ${MOVIE_SELECT}
      WHERE m.title LIKE ?
      GROUP BY m.movie_id
      ORDER BY m.title ASC
    `,
    [`%${searchTerm}%`],
  );
}

export async function findMoviesByGenre(genreName: string) {
  return query<MovieRow>(
    `
      ${MOVIE_SELECT}
      WHERE EXISTS (
        SELECT 1
        FROM movie_genres mg2
        JOIN genres g2 ON mg2.genre_id = g2.genre_id
        WHERE mg2.movie_id = m.movie_id
          AND g2.name = ?
      )
      GROUP BY m.movie_id
      ORDER BY m.title ASC
    `,
    [genreName],
  );
}