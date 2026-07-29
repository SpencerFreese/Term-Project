import "server-only";

import { findSeatsByShowtimeId  } from "@/lib/repositories/seatRepository";


export async function getSeatsForShowtime( showtimeId: number, userId: number | null = null) {
  return findSeatsByShowtimeId(showtimeId, userId);
}