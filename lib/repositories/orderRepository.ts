import "server-only";

import {
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

import {
  execute,
  query,
} from "@/lib/db";

import type {
  TicketCategory,
} from "@/lib/ticketPricing";

export type OrderStatus =
  | "confirmed"
  | "cancelled"
  | "refunded";

export type OrderEmailStatus =
  | "pending"
  | "sent"
  | "failed";

export type OrderTicketItem = {
  ticketCategory: TicketCategory;
  quantity: number;
  unitPrice: number;
};

export type OrderSeat = {
  seatId: number;
  rowLabel: string;
  seatNumber: number;
  seatType: string;
};

export type CustomerOrder = {
  orderId: number;
  confirmationCode: string;
  userId: number;
  showtimeId: number;

  movieTitle: string;
  roomName: string;
  startTime: string;
  formatType: string | null;

  confirmationEmail: string;

  cardType: string | null;
  cardLastFour: string;

  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  status: OrderStatus;
  emailStatus: OrderEmailStatus;
  createdAt: string;

  tickets: OrderTicketItem[];
  seats: OrderSeat[];
};

type OrderBaseRow =
  RowDataPacket &
    Omit<
      CustomerOrder,
      "tickets" | "seats"
    >;

type OrderTicketRow =
  RowDataPacket &
    OrderTicketItem & {
      orderId: number;
    };

type OrderSeatRow =
  RowDataPacket &
    OrderSeat & {
      orderId: number;
    };

/*
 * Creates the main completed order record.
 */
export async function insertOrder(
  connection: PoolConnection,
  input: {
    confirmationCode: string;
    userId: number;
    showtimeId: number;
    confirmationEmail: string;
    paymentCardId: number;
    cardType: string | null;
    cardLastFour: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  },
) {
  const [result] =
    await connection.execute<ResultSetHeader>(
      `
        INSERT INTO orders (
          confirmation_code,
          user_id,
          showtime_id,
          confirmation_email,
          payment_card_id,
          card_type_snapshot,
          card_last_four_snapshot,
          subtotal,
          tax_amount,
          total_amount,
          status,
          email_status
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'confirmed',
          'pending'
        )
      `,
      [
        input.confirmationCode,
        input.userId,
        input.showtimeId,
        input.confirmationEmail,
        input.paymentCardId,
        input.cardType,
        input.cardLastFour,
        input.subtotal,
        input.taxAmount,
        input.totalAmount,
      ],
    );

  return result.insertId;
}

/*
 * Stores the ticket-category breakdown.
 *
 * Example:
 * Adult x 2 at $14.50
 * Child x 1 at $9.50
 */
export async function insertOrderTicketItems(
  connection: PoolConnection,
  orderId: number,
  items: OrderTicketItem[],
) {
  for (const item of items) {
    await connection.execute(
      `
        INSERT INTO order_ticket_items (
          order_id,
          ticket_category,
          quantity,
          unit_price
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        orderId,
        item.ticketCategory,
        item.quantity,
        item.unitPrice,
      ],
    );
  }
}

/*
 * Stores every seat purchased in the order.
 */
export async function insertOrderSeats(
  connection: PoolConnection,
  orderId: number,
  showtimeId: number,
  seats: Array<{
    seatId: number;
    rowLabel: string;
    seatNumber: number;
    seatType: string;
  }>,
) {
  for (const seat of seats) {
    await connection.execute(
      `
        INSERT INTO order_seats (
          order_id,
          showtime_id,
          seat_id,
          row_label_snapshot,
          seat_number_snapshot,
          seat_type_snapshot
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        showtimeId,
        seat.seatId,
        seat.rowLabel,
        seat.seatNumber,
        seat.seatType,
      ],
    );
  }
}

/*
 * Records whether the confirmation email
 * was successfully sent.
 */
export async function updateOrderEmailStatus(
  orderId: number,
  status: OrderEmailStatus,
) {
  await execute(
    `
      UPDATE orders
      SET email_status = ?
      WHERE order_id = ?
    `,
    [
      status,
      orderId,
    ],
  );
}

/*
 * Loads the ticket and seat records belonging
 * to one or more orders.
 */
async function attachOrderItems(
  baseRows: OrderBaseRow[],
): Promise<CustomerOrder[]> {
  if (baseRows.length === 0) {
    return [];
  }

  const orderIds = baseRows.map(
    (row) => row.orderId,
  );

  const placeholders = orderIds
    .map(() => "?")
    .join(", ");

  const [
    ticketRows,
    seatRows,
  ] = await Promise.all([
    query<OrderTicketRow>(
      `
        SELECT
          order_id AS orderId,
          ticket_category
            AS ticketCategory,
          quantity,
          CAST(
            unit_price AS DOUBLE
          ) AS unitPrice
        FROM order_ticket_items
        WHERE order_id IN (
          ${placeholders}
        )
        ORDER BY
          order_ticket_item_id ASC
      `,
      orderIds,
    ),

    query<OrderSeatRow>(
      `
        SELECT
          order_id AS orderId,
          seat_id AS seatId,
          row_label_snapshot
            AS rowLabel,
          seat_number_snapshot
            AS seatNumber,
          seat_type_snapshot
            AS seatType
        FROM order_seats
        WHERE order_id IN (
          ${placeholders}
        )
        ORDER BY
          row_label_snapshot ASC,
          seat_number_snapshot ASC
      `,
      orderIds,
    ),
  ]);

  return baseRows.map(
    (row): CustomerOrder => ({
      ...row,

      tickets: ticketRows
        .filter(
          (ticket) =>
            ticket.orderId ===
            row.orderId,
        )
        .map(
          ({
            ticketCategory,
            quantity,
            unitPrice,
          }) => ({
            ticketCategory,
            quantity,
            unitPrice,
          }),
        ),

      seats: seatRows
        .filter(
          (seat) =>
            seat.orderId ===
            row.orderId,
        )
        .map(
          ({
            seatId,
            rowLabel,
            seatNumber,
            seatType,
          }) => ({
            seatId,
            rowLabel,
            seatNumber,
            seatType,
          }),
        ),
    }),
  );
}

const ORDER_BASE_SELECT = `
  SELECT
    o.order_id
      AS orderId,

    o.confirmation_code
      AS confirmationCode,

    o.user_id
      AS userId,

    o.showtime_id
      AS showtimeId,

    m.title
      AS movieTitle,

    tr.room_name
      AS roomName,

    DATE_FORMAT(
      st.start_time,
      '%Y-%m-%d %H:%i:%s'
    ) AS startTime,

    st.format_type
      AS formatType,

    o.confirmation_email
      AS confirmationEmail,

    o.card_type_snapshot
      AS cardType,

    o.card_last_four_snapshot
      AS cardLastFour,

    CAST(
      o.subtotal AS DOUBLE
    ) AS subtotal,

    CAST(
      o.tax_amount AS DOUBLE
    ) AS taxAmount,

    CAST(
      o.total_amount AS DOUBLE
    ) AS totalAmount,

    o.status,

    o.email_status
      AS emailStatus,

    DATE_FORMAT(
      o.created_at,
      '%Y-%m-%d %H:%i:%s'
    ) AS createdAt

  FROM orders o

  JOIN showtimes st
    ON st.showtime_id =
       o.showtime_id

  JOIN movies m
    ON m.movie_id =
       st.movie_id

  JOIN theater_rooms tr
    ON tr.theater_room_id =
       st.theater_room_id
`;

/*
 * Loads every order belonging to a customer.
 *
 * This will be used by /orders.
 */
export async function findOrdersByUserId(
  userId: number,
) {
  const rows =
    await query<OrderBaseRow>(
      `
        ${ORDER_BASE_SELECT}

        WHERE o.user_id = ?

        ORDER BY
          o.created_at DESC
      `,
      [userId],
    );

  return attachOrderItems(rows);
}

/*
 * Loads one specific order, but only when it
 * belongs to the logged-in customer.
 *
 * This prevents customers from changing the URL
 * to view another customer's order.
 */
export async function findOrderByIdForUser(
  orderId: number,
  userId: number,
) {
  const rows =
    await query<OrderBaseRow>(
      `
        ${ORDER_BASE_SELECT}

        WHERE o.order_id = ?
          AND o.user_id = ?

        LIMIT 1
      `,
      [
        orderId,
        userId,
      ],
    );

  const orders =
    await attachOrderItems(rows);

  return orders[0] ?? null;
}