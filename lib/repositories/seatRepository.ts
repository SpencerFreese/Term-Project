import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";

export type SeatAvailability = "available" | "reserved" | "reserved_by_you" | "booked";


export type Seat = {
  seatId: number;
  theaterRoomId: number;
  rowLabel: string;
  seatNumber: number;
  seatType: "standard" | "wheelchair" | "companion";
  availability: SeatAvailability;
};

type SeatRow = RowDataPacket & Seat;

export async function findSeatsByRoomId(theaterRoomId: number): Promise<Seat[]> {
  return query<SeatRow>(
    `
      SELECT
        seat_id AS seatId,
        theater_room_id AS theaterRoomId,
        row_label AS rowLabel,
        seat_number AS seatNumber,
        seat_type AS seatType,
        'available' AS availability
      FROM seats
      WHERE theater_room_id = ?
      ORDER BY row_label ASC, seat_number ASC
    `,
    [theaterRoomId],
  );
}

export async function findSeatsByShowtimeId(showtimeId: number, userId: number | null = null,): Promise<Seat[]> {
  return query<SeatRow>(
    `
      SELECT
        s.seat_id AS seatId,
        s.theater_room_id AS theaterRoomId,
        s.row_label AS rowLabel,
        s.seat_number AS seatNumber,
        s.seat_type AS seatType,

        CASE
            WHEN ss.status = 'booked'
                THEN 'booked'

            WHEN ss.status = 'reserved'
                AND ss.reserved_until > NOW()
                AND ? IS NOT NULL
                AND EXISTS (
                    SELECT 1
                    FROM booking_drafts bd

                    INNER JOIN booking_draft_seats bds
                        ON bds.booking_draft_id =
                          bd.booking_draft_id

                    WHERE bd.user_id = ?
                      AND bd.showtime_id = ?
                      AND bd.expires_at > NOW()
                      AND bds.seat_id = s.seat_id
                )
                THEN 'reserved_by_you'

            WHEN ss.status = 'reserved'
                AND ss.reserved_until > NOW()
                THEN 'reserved'

            ELSE 'available'
        END AS availability

      FROM showtimes st

      JOIN seats s
        ON s.theater_room_id =
           st.theater_room_id

      LEFT JOIN showtime_seats ss
        ON ss.showtime_id =
           st.showtime_id
        AND ss.seat_id =
            s.seat_id

      WHERE st.showtime_id = ?

      ORDER BY
        s.row_label ASC,
        s.seat_number ASC
    `,
    [userId, userId,showtimeId, showtimeId],
  );
}