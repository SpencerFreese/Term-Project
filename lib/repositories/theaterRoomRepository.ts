import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";

export type TheaterRoom = {
  theaterRoomId: number;
  roomName: string;
  seatRows: number;
  seatCols: number;
  formatType: string | null;
};

type TheaterRoomRow = RowDataPacket & TheaterRoom;

export async function findAllTheaterRooms() {
  return query<TheaterRoomRow>(
    `
      SELECT
        theater_room_id AS theaterRoomId,
        room_name AS roomName,
        seat_rows AS seatRows,
        seat_cols AS seatCols,
        format_type AS formatType
      FROM theater_rooms
      ORDER BY room_name ASC
    `,
  );
}

export async function findTheaterRoomById(
  theaterRoomId: number,
) {
  const rooms = await query<TheaterRoomRow>(
    `
      SELECT
        theater_room_id AS theaterRoomId,
        room_name AS roomName,
        seat_rows AS seatRows,
        seat_cols AS seatCols,
        format_type AS formatType
      FROM theater_rooms
      WHERE theater_room_id = ?
      LIMIT 1
    `,
    [theaterRoomId],
  );

  return rooms[0] ?? null;
}