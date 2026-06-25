import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";

export type Showtime = {
  showtimeId: number;
  movieId: number;
  movieTitle: string;
  theaterRoomId: number;
  roomName: string;
  startTime: string;
  endTime: string | null;
  formatType: string | null;
  status: "scheduled" | "cancelled" | "sold_out";
};

type ShowtimeRow = RowDataPacket & Showtime;

export async function findShowtimesByMovieId(movieId: number) {
  return query<ShowtimeRow>(
    `
      SELECT
        s.showtime_id AS showtimeId,
        s.movie_id AS movieId,
        m.title AS movieTitle,
        s.theater_room_id AS theaterRoomId,
        r.room_name AS roomName,
        DATE_FORMAT(s.start_time, '%Y-%m-%d %H:%i:%s') AS startTime,
        DATE_FORMAT(s.end_time, '%Y-%m-%d %H:%i:%s') AS endTime,
        s.format_type AS formatType,
        s.status
      FROM showtimes s
      JOIN movies m ON s.movie_id = m.movie_id
      JOIN theater_rooms r ON s.theater_room_id = r.theater_room_id
      WHERE s.movie_id = ?
      ORDER BY s.start_time ASC
    `,
    [movieId],
  );
}

export async function findShowtimeById(showtimeId: number) {
  const rows = await query<ShowtimeRow>(
    `
      SELECT
        s.showtime_id AS showtimeId,
        s.movie_id AS movieId,
        m.title AS movieTitle,
        s.theater_room_id AS theaterRoomId,
        r.room_name AS roomName,
        DATE_FORMAT(s.start_time, '%Y-%m-%d %H:%i:%s') AS startTime,
        DATE_FORMAT(s.end_time, '%Y-%m-%d %H:%i:%s') AS endTime,
        s.format_type AS formatType,
        s.status
      FROM showtimes s
      JOIN movies m ON s.movie_id = m.movie_id
      JOIN theater_rooms r ON s.theater_room_id = r.theater_room_id
      WHERE s.showtime_id = ?
      LIMIT 1
    `,
    [showtimeId],
  );

  return rows[0] ?? null;
}