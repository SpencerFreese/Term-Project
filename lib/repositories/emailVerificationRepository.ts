import "server-only";

import crypto from "node:crypto";
import { type RowDataPacket } from "mysql2/promise";
import { execute, query } from "@/lib/db";

type VerificationTokenRow = RowDataPacket & {
  verificationTokenId: number;
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

export async function createEmailVerificationToken(
  userId: number,
) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  await execute(
  `
    INSERT INTO email_verification_tokens (
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

export async function findValidVerificationToken(
  rawToken: string,
) {
  const tokenHash = hashToken(rawToken);

  const rows = await query<VerificationTokenRow>(
    `
      SELECT
        verification_token_id AS verificationTokenId,
        user_id AS userId,
        expires_at AS expiresAt,
        used_at AS usedAt
      FROM email_verification_tokens
      WHERE token_hash = ?
        AND used_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash],
  );

  return rows[0] ?? null;
}

export async function markVerificationTokenUsed(
  tokenId: number,
) {
  await execute(
    `
      UPDATE email_verification_tokens
      SET used_at = NOW()
      WHERE verification_token_id = ?
        AND used_at IS NULL
    `,
    [tokenId],
  );
}