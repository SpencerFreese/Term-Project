import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";

export type Seat = {
  seatId: number;
  theaterRoomId: number;
  rowLabel: string;
  seatNumber: number;
  seatType: "standard" | "wheelchair" | "companion";
};

type SeatRow = RowDataPacket & Seat;

export async function findSeatsByRoomId(theaterRoomId: number) {
  return query<SeatRow>(
    `
      SELECT
        seat_id AS seatId,
        theater_room_id AS theaterRoomId,
        row_label AS rowLabel,
        seat_number AS seatNumber,
        seat_type AS seatType
      FROM seats
      WHERE theater_room_id = ?
      ORDER BY row_label ASC, seat_number ASC
    `,
    [theaterRoomId],
  );
}
