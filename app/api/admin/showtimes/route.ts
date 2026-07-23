import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  AdminShowtimeValidationError,
  createAdminShowtime,
} from "@/lib/services/adminShowtimeService";

function isDuplicateEntryError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "You must be logged in as an administrator.",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const showtime = await createAdminShowtime({
      movieId: Number(body.movieId),

      theaterRoomId: Number(
        body.theaterRoomId,
      ),

      startTime:
        typeof body.startTime === "string"
          ? body.startTime
          : "",
    });

    return NextResponse.json(
      {
        showtime,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (
      error instanceof
      AdminShowtimeValidationError
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.statusCode,
        },
      );
    }

    if (isDuplicateEntryError(error)) {
      return NextResponse.json(
        {
          error:
            "That showroom already has a showtime beginning at the selected time.",
        },
        {
          status: 409,
        },
      );
    }

    console.error(
      "Failed to create showtime:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to schedule the showtime.",
      },
      {
        status: 500,
      },
    );
  }
}