import "server-only";

import { findShowtimeById } from "@/lib/repositories/showtimeRepository";

export async function getShowtimeDetails(showtimeId: number) {
  if (!Number.isInteger(showtimeId) || showtimeId <= 0) {
    return null;
  }

  return findShowtimeById(showtimeId);
}