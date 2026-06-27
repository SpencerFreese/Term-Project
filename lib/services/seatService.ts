import "server-only";

import { findSeatsByRoomId } from "@/lib/repositories/seatRepository";

export async function getSeatsForRoom(theaterRoomId: number) {
  if (!Number.isInteger(theaterRoomId) || theaterRoomId <= 0) {
    return [];
  }

  return findSeatsByRoomId(theaterRoomId);
}
