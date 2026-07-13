import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { execute, query } from "@/lib/db";

export type AuthUserRow = RowDataPacket & {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  status: "unverified" | "active" | "suspended";
  role: "customer" | "admin";
};

export async function findAuthUserByEmail(email: string) {
  const rows = await query<AuthUserRow>(
    `
      SELECT
        user_id AS userId,
        first_name AS firstName,
        last_name AS lastName,
        email,
        password_hash AS passwordHash,
        status,
        role
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
}

export async function findUserProfileById(userId: number) {
  const rows = await query<
    RowDataPacket & {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string | null;
      role: "customer" | "admin";
      promoSubscribed: number;
    }
  >(
    `
      SELECT
        user_id AS userId,
        first_name AS firstName,
        last_name AS lastName,
        email,
        phone_number AS phoneNumber,
        role,
        promo_subscribed AS promoSubscribed
      FROM users
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] ?? null;
}

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  passwordHash: string;
  promoSubscribed: boolean;
};

export async function createCustomer(input: CreateUserInput) {
  const result = await execute(
    `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        phone_number,
        password_hash,
        status,
        role,
        promo_subscribed
      )
      VALUES (?, ?, ?, ?, ?, 'unverified', 'customer', ?)
    `,
    [
      input.firstName,
      input.lastName,
      input.email,
      input.phoneNumber,
      input.passwordHash,
      input.promoSubscribed,
    ],
  );

  return result.insertId;
}

export async function activateUser(userId: number) {
  await execute(
    `
      UPDATE users
      SET status = 'active'
      WHERE user_id = ?
        AND status = 'unverified'
    `,
    [userId],
  );
}

export async function updateUserPassword(
  userId: number,
  passwordHash: string,
) {
  await execute(
    `
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
    `,
    [passwordHash, userId],
  );
}

