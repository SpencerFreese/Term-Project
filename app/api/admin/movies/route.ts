import {NextResponse} from "next/server";
import { getSession } from "@/lib/auth";
import {
  AdminMovieValidationError,
  createAdminMovie,
} from "@/lib/services/adminMovieService";


function isDuplicateEntryError(
  error: unknown,
) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}

export async function POST(
  request: Request,
) {
  const session =
    await getSession();

  if (
    !session ||
    session.role !== "admin"
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body =
      await request.json();

    const movieId =
      await createAdminMovie(
        body,
      );

    return NextResponse.json(
      {
        movieId,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (
      error instanceof
      AdminMovieValidationError
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status:
            error.statusCode,
        },
      );
    }

    if (
      isDuplicateEntryError(
        error,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A movie with this title and release date already exists.",
        },
        {
          status: 409,
        },
      );
    }

    console.error(
      "Failed to create movie:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to add the movie. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}