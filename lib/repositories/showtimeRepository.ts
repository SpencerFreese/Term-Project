import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { query, execute } from "@/lib/db";

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

export type InsertShowtimeInput = {
  movieId: number;
  theaterRoomId: number;
  startTime: string;
  endTime: string;
  formatType: string | null;
};

export type ShowtimeRow = RowDataPacket & Showtime;

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

export async function findUpcomingScheduledShowtimes() {
  return query<ShowtimeRow>(
    `
      SELECT
        s.showtime_id AS showtimeId,
        s.movie_id AS movieId,
        m.title AS movieTitle,
        s.theater_room_id AS theaterRoomId,
        r.room_name AS roomName,
        DATE_FORMAT(
          s.start_time,
          '%Y-%m-%d %H:%i:%s'
        ) AS startTime,
        DATE_FORMAT(
          s.end_time,
          '%Y-%m-%d %H:%i:%s'
        ) AS endTime,
        s.format_type AS formatType,
        s.status
      FROM showtimes s
      JOIN movies m
        ON s.movie_id = m.movie_id
      JOIN theater_rooms r
        ON s.theater_room_id = r.theater_room_id
      WHERE s.status = 'scheduled'
        AND s.start_time >= NOW()
      ORDER BY s.start_time ASC
    `,
  );
}

export async function findShowtimeConflict(
  theaterRoomId: number,
  newStartTime: string,
  newEndTime: string,
) {
  const showtimes = await query<ShowtimeRow>(
    `
      SELECT
        s.showtime_id AS showtimeId,
        s.movie_id AS movieId,
        m.title AS movieTitle,
        s.theater_room_id AS theaterRoomId,
        r.room_name AS roomName,
        DATE_FORMAT(
          s.start_time,
          '%Y-%m-%d %H:%i:%s'
        ) AS startTime,
        DATE_FORMAT(
          s.end_time,
          '%Y-%m-%d %H:%i:%s'
        ) AS endTime,
        s.format_type AS formatType,
        s.status
      FROM showtimes s
      JOIN movies m
        ON s.movie_id = m.movie_id
      JOIN theater_rooms r
        ON s.theater_room_id = r.theater_room_id
      WHERE s.theater_room_id = ?
        AND s.status = 'scheduled'
        AND s.start_time < ?
        AND COALESCE(
          s.end_time,
          DATE_ADD(s.start_time, INTERVAL 3 HOUR)
        ) > ?
      ORDER BY s.start_time ASC
      LIMIT 1
    `,
    [
      theaterRoomId,
      newEndTime,
      newStartTime,
    ],
  );

  return showtimes[0] ?? null;
}

export async function insertShowtime(
  input: InsertShowtimeInput,
) {
  const result = await execute(
    `
      INSERT INTO showtimes (
        movie_id,
        theater_room_id,
        start_time,
        end_time,
        format_type,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'scheduled')
    `,
    [
      input.movieId,
      input.theaterRoomId,
      input.startTime,
      input.endTime,
      input.formatType,
    ],
  );

  return result.insertId;
}