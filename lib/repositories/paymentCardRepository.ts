import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { execute, query } from "@/lib/db";

export const MAX_CARDS_PER_USER = 3;

export type PaymentCardRow = RowDataPacket & {
  cardId: number;
  userId: number;
  cardNumberEncrypted: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: string | null;
  cardOrder: number;
};

export type CreatePaymentCardInput = {
  cardNumberEncrypted: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: string | null;
};

export async function findCardsByUserId(userId: number) {
  return query<PaymentCardRow>(
    `
      SELECT
        card_id AS cardId,
        user_id AS userId,
        card_number_encrypted AS cardNumberEncrypted,
        cardholder_name AS cardholderName,
        expiry_month AS expiryMonth,
        expiry_year AS expiryYear,
        card_type AS cardType,
        card_order AS cardOrder
      FROM user_payment_cards
      WHERE user_id = ?
      ORDER BY card_order ASC
    `,
    [userId],
  );
}

export async function countCardsByUserId(userId: number) {
  const rows = await query<RowDataPacket & { total: number }>(
    `
      SELECT COUNT(*) AS total
      FROM user_payment_cards
      WHERE user_id = ?
    `,
    [userId],
  );

  return rows[0]?.total ?? 0;
}

export async function findCardById(cardId: number, userId: number) {
  const rows = await query<PaymentCardRow>(
    `
      SELECT
        card_id AS cardId,
        user_id AS userId,
        card_number_encrypted AS cardNumberEncrypted,
        cardholder_name AS cardholderName,
        expiry_month AS expiryMonth,
        expiry_year AS expiryYear,
        card_type AS cardType,
        card_order AS cardOrder
      FROM user_payment_cards
      WHERE card_id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [cardId, userId],
  );

  return rows[0] ?? null;
}

export async function addCard(
  userId: number,
  input: CreatePaymentCardInput,
) {
  const existingCount = await countCardsByUserId(userId);

  if (existingCount >= MAX_CARDS_PER_USER) {
    throw new Error("MAX_CARDS_REACHED");
  }

  const result = await execute(
    `
      INSERT INTO user_payment_cards (
        user_id,
        card_number_encrypted,
        cardholder_name,
        expiry_month,
        expiry_year,
        card_type,
        card_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      input.cardNumberEncrypted,
      input.cardholderName,
      input.expiryMonth,
      input.expiryYear,
      input.cardType,
      existingCount + 1,
    ],
  );

  return result.insertId;
}

export async function deleteCard(cardId: number, userId: number) {
  await execute(
    `
      DELETE FROM user_payment_cards
      WHERE card_id = ?
        AND user_id = ?
    `,
    [cardId, userId],
  );
}
