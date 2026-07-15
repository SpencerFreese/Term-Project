import "server-only";

import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const secret =
    process.env.CARD_ENCRYPTION_KEY ?? "dev_card_key_change_me_please";

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptCardNumber(cardNumber: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(cardNumber, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptCardNumber(payload: string) {
  const [ivB64, authTagB64, dataB64] = payload.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivB64, "base64"),
  );

  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function lastFourDigits(payload: string) {
  return decryptCardNumber(payload).slice(-4);
}
