import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { query, execute } from "@/lib/db";

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

export type MovieFilters = {
  status?: MovieStatus;
  searchTerm?: string;
  genres?: string[];
  showDate?: string;
};

export type InsertMovieInput = {
  title: string;
  description: string | null;
  posterUrl: string | null;
  trailerUrl: string | null;
  mpaaRating: string | null;
  castList: string | null;
  runtimeMinutes: number | null;
  releaseDate: string | null;
  status: MovieStatus;
  genreIds: number[];
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

function cleanGenres(genres?: string[]) {
  return [...new Set((genres ?? []).map((genre) => genre.trim()).filter(Boolean))];
}

function isValidShowDate(showDate?: string) {
  return Boolean(showDate && /^\d{4}-\d{2}-\d{2}$/.test(showDate));
}

export async function findMovies(filters: MovieFilters = {}) {
  const whereClauses: string[] = [];
  const params: Array<string | number> = [];

  if (filters.status) {
    whereClauses.push("m.status = ?");
    params.push(filters.status);
  }

  if (filters.searchTerm?.trim()) {
    whereClauses.push("m.title LIKE ?");
    params.push(`%${filters.searchTerm.trim()}%`);
  }

  const selectedGenres = cleanGenres(filters.genres);

  if (selectedGenres.length > 0) {
    const placeholders = selectedGenres.map(() => "?").join(", ");

    whereClauses.push(`
      m.movie_id IN (
        SELECT mg2.movie_id
        FROM movie_genres mg2
        JOIN genres g2 ON mg2.genre_id = g2.genre_id
        WHERE g2.name IN (${placeholders})
        GROUP BY mg2.movie_id
        HAVING COUNT(DISTINCT g2.name) = ?
      )
    `);

    params.push(...selectedGenres, selectedGenres.length);
  }

  if (isValidShowDate(filters.showDate)) {
    whereClauses.push(`
      EXISTS (
        SELECT 1
        FROM showtimes s2
        WHERE s2.movie_id = m.movie_id
          AND s2.status = 'scheduled'
          AND s2.start_time >= ?
          AND s2.start_time < DATE_ADD(?, INTERVAL 1 DAY)
      )
    `);

    params.push(filters.showDate!, filters.showDate!);
  }

  return query<MovieRow>(
    `
      ${MOVIE_SELECT}
      ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
      GROUP BY m.movie_id
      ORDER BY m.release_date ASC, m.title ASC
    `,
    params,
  );
}

export async function findMoviesByStatus(status: MovieStatus) {
  return findMovies({ status });
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
  return findMovies({ searchTerm });
}

export async function findMoviesByGenre(genreName: string) {
  return findMovies({ genres: [genreName] });
}

export async function insertMovie(input: InsertMovieInput) {
  const result = await execute(
    `
      INSERT INTO movies (
        title,
        description,
        poster_url,
        trailer_url,
        mpaa_rating,
        cast_list,
        runtime_minutes,
        release_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.title,
      input.description,
      input.posterUrl,
      input.trailerUrl,
      input.mpaaRating,
      input.castList,
      input.runtimeMinutes,
      input.releaseDate,
      input.status,
    ],
  );

  const movieId = result.insertId;

  if (input.genreIds.length > 0) {
    for (const genreId of input.genreIds) {
      await execute(
        `
          INSERT IGNORE INTO movie_genres (movie_id, genre_id)
          VALUES (?, ?)
        `,
        [movieId, genreId],
      );
    }
  }

  return movieId;
}