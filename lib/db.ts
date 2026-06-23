import "server-only";

import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

type SqlValue = string | number | bigint | boolean | Date | null;

declare global {
  var mysqlPool: Pool | undefined;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const pool =
  globalThis.mysqlPool ??
  mysql.createPool({
    host: getRequiredEnv("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: getRequiredEnv("MYSQL_USER"),
    password: getRequiredEnv("MYSQL_PASSWORD"),
    database: getRequiredEnv("MYSQL_DATABASE"),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.mysqlPool = pool;
}

export async function query<T extends RowDataPacket>(
  sql: string,
  values: SqlValue[] = [],
) {
  const [rows] = await pool.execute<T[]>(sql, values);
  return rows;
}
