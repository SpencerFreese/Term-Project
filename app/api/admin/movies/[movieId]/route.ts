import {
  NextResponse,
} from "next/server";
import { getSession } from "@/lib/auth";
import {
  AdminMovieValidationError,
  updateAdminMovie,
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

export async function PUT(
  request: Request,

  {
    params,
  }: {
    params: Promise<{
      movieId: string;
    }>;
  },
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
    const {
      movieId: movieIdText,
    } = await params;

    const movieId =
      Number(movieIdText);

    const body =
      await request.json();

    await updateAdminMovie(
      movieId,
      body,
    );

    return NextResponse.json({
      movieId,
    });
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
      "Failed to update movie:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update the movie. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}