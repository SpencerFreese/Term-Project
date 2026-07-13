import "server-only";

import crypto from "node:crypto";
import { type RowDataPacket } from "mysql2/promise";
import { execute, query } from "@/lib/db";

type PasswordResetTokenRow = RowDataPacket & {
  passwordResetTokenId: number;
  userId: number;
  expiresAt: Date;
  usedAt: Date | null;
};

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createPasswordResetToken(
  userId: number,
) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  // Invalidate any older unused tokens for this user.
  await execute(
    `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = ?
        AND used_at IS NULL
    `,
    [userId],
  );

  await execute(
    `
      INSERT INTO password_reset_tokens (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))
    `,
    [userId, tokenHash],
  );

  return rawToken;
}

export async function findValidPasswordResetToken(
  rawToken: string,
) {
  const tokenHash = hashToken(rawToken);

  const rows = await query<PasswordResetTokenRow>(
    `
      SELECT
        password_reset_token_id AS passwordResetTokenId,
        user_id AS userId,
        expires_at AS expiresAt,
        used_at AS usedAt
      FROM password_reset_tokens
      WHERE token_hash = ?
        AND used_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash],
  );

  return rows[0] ?? null;
}

export async function markPasswordResetTokenUsed(
  tokenId: number,
) {
  await execute(
    `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE password_reset_token_id = ?
        AND used_at IS NULL
    `,
    [tokenId],
  );
}