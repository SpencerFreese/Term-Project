import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";

export type Genre = {
  genreId: number;
  name: string;
};

type GenreRow = RowDataPacket & Genre;

export async function findAllGenres() {
  return query<GenreRow>(
    `
      SELECT
        genre_id AS genreId,
        name
      FROM genres
      ORDER BY name ASC
    `,
  );
}