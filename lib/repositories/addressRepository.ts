import "server-only";

import { type RowDataPacket } from "mysql2/promise";
import { execute, query } from "@/lib/db";

export type AddressRow = RowDataPacket & {
  addressId: number;
  userId: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export type AddressInput = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export async function findAddressByUserId(userId: number) {
  const rows = await query<AddressRow>(
    `
      SELECT
        address_id AS addressId,
        user_id AS userId,
        street,
        city,
        state,
        zip_code AS zipCode,
        country
      FROM user_addresses
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] ?? null;
}

export async function upsertAddress(
  userId: number,
  input: AddressInput,
) {
  await execute(
    `
      INSERT INTO user_addresses (
        user_id,
        street,
        city,
        state,
        zip_code,
        country
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        street = VALUES(street),
        city = VALUES(city),
        state = VALUES(state),
        zip_code = VALUES(zip_code),
        country = VALUES(country)
    `,
    [
      userId,
      input.street,
      input.city,
      input.state,
      input.zipCode,
      input.country,
    ],
  );
}

export async function deleteAddress(userId: number) {
  await execute(
    `
      DELETE FROM user_addresses
      WHERE user_id = ?
    `,
    [userId],
  );
}
