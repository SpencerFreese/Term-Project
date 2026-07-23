import "server-only";

import { findSeatsByShowtimeId  } from "@/lib/repositories/seatRepository";


export async function getSeatsForShowtime(showtimeId: number): Promise<Seat[]> {
  if (!Number.isInteger(showtimeId) ||showtimeId <= 0) {
    throw new Error("Invalid showtime ID.");
  }
  
  return findSeatsByShowtimeId(showtimeId);
}