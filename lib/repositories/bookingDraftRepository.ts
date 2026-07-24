import "server-only";

import {
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

import { query } from "@/lib/db";
import type {
  TicketQuantities,
} from "@/lib/ticketPricing";

export type BookingDraftSeat = {
  seatId: number;
  theaterRoomId: number;
  rowLabel: string;
  seatNumber: number;
  seatType:
    | "standard"
    | "wheelchair"
    | "companion";
};

export type BookingDraftDetails = {
  bookingDraftId: number;
  checkoutToken: string;
  showtimeId: number;

  movieId: number;
  movieTitle: string;

  theaterRoomId: number;
  roomName: string;

  startTime: string;
  endTime: string | null;
  formatType: string | null;

  showtimeStatus:
    | "scheduled"
    | "cancelled"
    | "sold_out";

  quantities: TicketQuantities;
  expiresAt: string;

  selectedSeats: BookingDraftSeat[];
};

type DraftRow = RowDataPacket & {
  bookingDraftId: number;
  checkoutToken: string;
  showtimeId: number;

  movieId: number;
  movieTitle: string;

  theaterRoomId: number;
  roomName: string;

  startTime: string;
  endTime: string | null;
  formatType: string | null;

  showtimeStatus:"scheduled"  | "cancelled"  | "sold_out";

  adultQuantity: number;
  seniorQuantity: number;
  childQuantity: number;

  expiresAt: string;
};

type DraftForUpdateRow =
  RowDataPacket & {
    bookingDraftId: number;
    userId: number | null;
    checkoutToken: string;
    showtimeId: number;

    adultQuantity: number;
    seniorQuantity: number;
    childQuantity: number;

    expiresAt: Date;
  };

type BookingDraftExpiryRow =
  RowDataPacket & {
    expiresAt: Date;
  };

/*
 * Inserts the main temporary booking draft.
 *
 * This stores the showtime, ticket quantities,
 * checkout token, and expiration time.
 */
export async function insertBookingDraft(
  connection: PoolConnection,
  input: {
    userId: number | null;
    checkoutToken: string;
    showtimeId: number;
    quantities: TicketQuantities;
  },
) {
  const [result] =
    await connection.execute<ResultSetHeader>(
      `
        INSERT INTO booking_drafts (
          user_id,
          checkout_token,
          showtime_id,
          adult_quantity,
          senior_quantity,
          child_quantity,
          expires_at
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          DATE_ADD(NOW(), INTERVAL 1 HOUR)
        )
      `,
      [
        input.userId,
        input.checkoutToken,
        input.showtimeId,
        input.quantities.adult,
        input.quantities.senior,
        input.quantities.child,
      ],
    );

  const [rows] =
    await connection.execute<
      BookingDraftExpiryRow[]
    >(
      `
        SELECT
          expires_at AS expiresAt
        FROM booking_drafts
        WHERE booking_draft_id = ?
        LIMIT 1
      `,
      [result.insertId],
    );

  const draft = rows[0];

  if (!draft) {
    throw new Error(
      "The booking draft could not be retrieved.",
    );
  }

  return {
    bookingDraftId: result.insertId,
    expiresAt: draft.expiresAt,
  };
}

/*
 * Inserts the seats selected for the draft.
 */
export async function insertBookingDraftSeats(
  connection: PoolConnection,
  bookingDraftId: number,
  seatIds: number[],
) {
  for (const seatId of seatIds) {
    await connection.execute(
      `
        INSERT INTO booking_draft_seats (
          booking_draft_id,
          seat_id
        )
        VALUES (?, ?)
      `,
      [
        bookingDraftId,
        seatId,
      ],
    );
  }
}

/*
 * Loads and locks a draft during final checkout.
 *
 * FOR UPDATE prevents two checkout requests from
 * completing the same draft at the same time.
 */
export async function findBookingDraftForUpdate(
  connection: PoolConnection,
  checkoutToken: string,
) {
  const [rows] =
    await connection.execute<
      DraftForUpdateRow[]
    >(
      `
        SELECT
          booking_draft_id AS bookingDraftId,
          user_id AS userId,
          checkout_token AS checkoutToken,
          showtime_id AS showtimeId,
          adult_quantity AS adultQuantity,
          senior_quantity AS seniorQuantity,
          child_quantity AS childQuantity,
          expires_at AS expiresAt
        FROM booking_drafts
        WHERE checkout_token = ?
        LIMIT 1
        FOR UPDATE
      `,
      [checkoutToken],
    );

  return rows[0] ?? null;
}

/*
 * Loads and locks the draft's selected seat IDs.
 */
export async function findBookingDraftSeatIdsForUpdate(
  connection: PoolConnection,
  bookingDraftId: number,
) {
  const [rows] =
    await connection.execute<
      Array<
        RowDataPacket & {
          seatId: number;
        }
      >
    >(
      `
        SELECT
          seat_id AS seatId
        FROM booking_draft_seats
        WHERE booking_draft_id = ?
        ORDER BY seat_id ASC
        FOR UPDATE
      `,
      [bookingDraftId],
    );

  return rows.map(
    (row) => row.seatId,
  );
}

/*
 * Deletes a completed or abandoned draft.
 *
 * booking_draft_seats rows are automatically
 * deleted because of ON DELETE CASCADE.
 */
export async function deleteBookingDraft(
  connection: PoolConnection,
  bookingDraftId: number,
) {
  await connection.execute(
    `
      DELETE FROM booking_drafts
      WHERE booking_draft_id = ?
    `,
    [bookingDraftId],
  );
}

export async function assignBookingDraftToUser(
  connection: PoolConnection,
  bookingDraftId: number,
  userId: number,
): Promise<void> {
  await connection.execute(
    `
      UPDATE booking_drafts
      SET user_id = ?
      WHERE booking_draft_id = ?
        AND user_id IS NULL
    `,
    [
      userId,
      bookingDraftId,
    ],
  );
}

/*
 * Loads the complete draft for the checkout page.
 *
 * Expired drafts are not returned.
 */
export async function findBookingDraftDetailsByToken(
  checkoutToken: string,
): Promise<BookingDraftDetails | null> {
  const rows = await query<DraftRow>(
    `
      SELECT
        bd.booking_draft_id
          AS bookingDraftId,
        bd.checkout_token
          AS checkoutToken,
        bd.showtime_id
          AS showtimeId,

        st.movie_id
          AS movieId,
        m.title
          AS movieTitle,

        st.theater_room_id
          AS theaterRoomId,
        tr.room_name
          AS roomName,

        DATE_FORMAT(
          st.start_time,
          '%Y-%m-%d %H:%i:%s'
        ) AS startTime,

        DATE_FORMAT(
          st.end_time,
          '%Y-%m-%d %H:%i:%s'
        ) AS endTime,

        st.format_type
          AS formatType,
        st.status
          AS showtimeStatus,

        bd.adult_quantity
          AS adultQuantity,
        bd.senior_quantity
          AS seniorQuantity,
        bd.child_quantity
          AS childQuantity,

        DATE_FORMAT(
          bd.expires_at,
          '%Y-%m-%d %H:%i:%s'
        ) AS expiresAt

      FROM booking_drafts bd

      JOIN showtimes st
        ON st.showtime_id =
           bd.showtime_id

      JOIN movies m
        ON m.movie_id =
           st.movie_id

      JOIN theater_rooms tr
        ON tr.theater_room_id =
           st.theater_room_id

      WHERE bd.checkout_token = ?
        AND bd.expires_at > NOW()

      LIMIT 1
    `,
    [checkoutToken],
  );

  const draft = rows[0];

  if (!draft) {
    return null;
  }

  const selectedSeats =
    await query<
      RowDataPacket &
        BookingDraftSeat
    >(
      `
        SELECT
          s.seat_id
            AS seatId,
          s.theater_room_id
            AS theaterRoomId,
          s.row_label
            AS rowLabel,
          s.seat_number
            AS seatNumber,
          s.seat_type
            AS seatType

        FROM booking_draft_seats bds

        JOIN seats s
          ON s.seat_id =
             bds.seat_id

        WHERE bds.booking_draft_id = ?

        ORDER BY
          s.row_label ASC,
          s.seat_number ASC
      `,
      [draft.bookingDraftId],
    );

  return {
    bookingDraftId:
      draft.bookingDraftId,

    checkoutToken:
      draft.checkoutToken,

    showtimeId:
      draft.showtimeId,

    movieId:
      draft.movieId,

    movieTitle:
      draft.movieTitle,

    theaterRoomId:
      draft.theaterRoomId,

    roomName:
      draft.roomName,

    startTime:
      draft.startTime,

    endTime:
      draft.endTime,

    formatType:
      draft.formatType,

    showtimeStatus:
      draft.showtimeStatus,

    quantities: {
      adult:
        draft.adultQuantity,

      senior:
        draft.seniorQuantity,

      child:
        draft.childQuantity,
    },

    expiresAt:
      draft.expiresAt,

    selectedSeats,
  };
}

type CheckoutShowtimeRow = RowDataPacket & {
  showtimeId: number;
  theaterRoomId: number;
  startTime: Date;
  status:
    | "scheduled"
    | "cancelled"
    | "sold_out";
};

export type CheckoutSeatStatus = {
  seatId: number;
  theaterRoomId: number;
  rowLabel: string;
  seatNumber: number;
  seatType: string;
  status: "reserved" | "booked" | null;
  reservedUntil: Date | null;
};

type CheckoutSeatStatusRow =
  RowDataPacket & CheckoutSeatStatus;

/*
 * Removes expired temporary checkout data.
 *
 * Expired showtime reservations become available
 * again, and expired drafts are removed.
 */
export async function deleteExpiredCheckoutData(
  connection: PoolConnection,
) {
  await connection.execute(
    `
      DELETE FROM showtime_seats
      WHERE status = 'reserved'
        AND reserved_until IS NOT NULL
        AND reserved_until <= NOW()
    `,
  );

  await connection.execute(
    `
      DELETE FROM booking_drafts
      WHERE expires_at <= NOW()
    `,
  );
}

export async function deleteUserDraftsForShowtime(
  connection: PoolConnection,
  input: {
    userId: number;
    showtimeId: number;
  },
): Promise<void> {
  await connection.execute(
    `
      DELETE ss
      FROM showtime_seats ss

      INNER JOIN booking_draft_seats bds
        ON bds.seat_id = ss.seat_id

      INNER JOIN booking_drafts bd
        ON bd.booking_draft_id =
           bds.booking_draft_id

      WHERE bd.user_id = ?
        AND bd.showtime_id = ?
        AND ss.showtime_id = ?
        AND ss.status = 'reserved'
    `,
    [
      input.userId,
      input.showtimeId,
      input.showtimeId,
    ],
  );

  await connection.execute(
    `
      DELETE FROM booking_drafts
      WHERE user_id = ?
        AND showtime_id = ?
    `,
    [
      input.userId,
      input.showtimeId,
    ],
  );
}

/*
 * Loads and locks the selected showtime.
 */
export async function findCheckoutShowtimeForUpdate(
  connection: PoolConnection,
  showtimeId: number,
) {
  const [rows] =
    await connection.execute<
      CheckoutShowtimeRow[]
    >(
      `
        SELECT
          showtime_id AS showtimeId,
          theater_room_id AS theaterRoomId,
          start_time AS startTime,
          status
        FROM showtimes
        WHERE showtime_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [showtimeId],
    );

  return rows[0] ?? null;
}

/*
 * Loads the selected physical seats and checks
 * whether they already have a reservation or booking
 * for this particular showtime.
 */
export async function findCheckoutSeatsForUpdate(
  connection: PoolConnection,
  input: {
    showtimeId: number;
    theaterRoomId: number;
    seatIds: number[];
  },
): Promise<CheckoutSeatStatus[]> {
  if (input.seatIds.length === 0) {
    return [];
  }

  const placeholders = input.seatIds
    .map(() => "?")
    .join(", ");

  const [rows] =
    await connection.execute<
      CheckoutSeatStatusRow[]
    >(
      `
        SELECT
          s.seat_id AS seatId,
          s.theater_room_id AS theaterRoomId,
          s.row_label AS rowLabel,
          s.seat_number AS seatNumber,
          s.seat_type AS seatType,
          ss.status,
          ss.reserved_until AS reservedUntil

        FROM seats s

        LEFT JOIN showtime_seats ss
          ON ss.showtime_id = ?
          AND ss.seat_id = s.seat_id

        WHERE s.theater_room_id = ?
          AND s.seat_id IN (
            ${placeholders}
          )

        ORDER BY s.seat_id ASC
        FOR UPDATE
      `,
      [
        input.showtimeId,
        input.theaterRoomId,
        ...input.seatIds,
      ],
    );

  return rows;
}

/*
 * Temporarily reserves selected seats.
 *
 * The showtime_seats primary key prevents another
 * draft from reserving the same seat for the same
 * showtime.
 */
export async function reserveCheckoutSeats(
  connection: PoolConnection,
  input: {
    bookingDraftId: number;
    showtimeId: number;
    seatIds: number[];
  },
) {
  for (const seatId of input.seatIds) {
    await connection.execute(
      `
        INSERT INTO showtime_seats (
          showtime_id,
          seat_id,
          status,
          reserved_at,
          reserved_until
        )
        SELECT
          ?,
          ?,
          'reserved',
          NOW(),
          expires_at
        FROM booking_drafts
        WHERE booking_draft_id = ?
      `,
      [
        input.showtimeId,
        seatId,
        input.bookingDraftId,
      ],
    );
  }
}

export async function markCheckoutSeatsBooked(
  connection: PoolConnection,
  input: {
    showtimeId: number;
    seatIds: number[];
  },
) {
  if (input.seatIds.length === 0) {
    return 0;
  }

  const placeholders =
    input.seatIds
      .map(() => "?")
      .join(", ");

  const [result] =
    await connection.execute<ResultSetHeader>(
      `
        UPDATE showtime_seats
        SET
          status = 'booked',
          reserved_at = NULL,
          reserved_until = NULL
        WHERE showtime_id = ?
          AND seat_id IN (
            ${placeholders}
          )
          AND status = 'reserved'
          AND reserved_until > NOW()
      `,
      [
        input.showtimeId,
        ...input.seatIds,
      ],
    );

  return result.affectedRows;
}