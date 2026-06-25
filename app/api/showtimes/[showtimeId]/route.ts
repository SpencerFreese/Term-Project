import { NextResponse } from "next/server";
import { getShowtimeDetails } from "@/lib/services/showtimeService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ showtimeId: string }> },
) {
  const { showtimeId } = await params;
  const showtime = await getShowtimeDetails(Number(showtimeId));

  if (!showtime) {
    return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
  }

  return NextResponse.json({ showtime });
}