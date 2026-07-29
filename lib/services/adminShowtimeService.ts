import "server-only";

import {
  findMovieById,
} from "@/lib/repositories/movieRepository";

import {
  findShowtimeById,
  findShowtimeConflict,
  insertShowtime,
} from "@/lib/repositories/showtimeRepository";

import {
  findTheaterRoomById,
} from "@/lib/repositories/theaterRoomRepository";

export class AdminShowtimeValidationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);

    this.name =
      "AdminShowtimeValidationError";
  }
}

type CreateShowtimeInput = {
  movieId: number;
  theaterRoomId: number;
  startTime: string;
};

type ParsedDateTime = {
  sqlValue: string;
  timestamp: number;
};

function parseDateTimeLocal(
  value: string,
): ParsedDateTime | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(
      value,
    );

  if (!match) {
    return null;
  }

  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
  ] = match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  /*
   * UTC is used here for date validation and runtime
   * arithmetic. The final SQL string preserves exactly
   * what the administrator entered.
   */
  const timestamp = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
  );

  const parsedDate = new Date(timestamp);

  const isValid =
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day &&
    parsedDate.getUTCHours() === hour &&
    parsedDate.getUTCMinutes() === minute;

  if (!isValid) {
    return null;
  }

  return {
    sqlValue:
      `${yearText}-${monthText}-${dayText} ` +
      `${hourText}:${minuteText}:00`,

    timestamp,
  };
}

function formatSqlDateTime(
  timestamp: number,
) {
  const date = new Date(timestamp);

  const year =
    date.getUTCFullYear();

  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getUTCDate(),
  ).padStart(2, "0");

  const hour = String(
    date.getUTCHours(),
  ).padStart(2, "0");

  const minute = String(
    date.getUTCMinutes(),
  ).padStart(2, "0");

  return (
    `${year}-${month}-${day} ` +
    `${hour}:${minute}:00`
  );
}

export async function createAdminShowtime(
  input: CreateShowtimeInput,
) {
  if (
    !Number.isInteger(input.movieId) ||
    input.movieId <= 0
  ) {
    throw new AdminShowtimeValidationError(
      "Select a valid movie.",
    );
  }

  if (
    !Number.isInteger(
      input.theaterRoomId,
    ) ||
    input.theaterRoomId <= 0
  ) {
    throw new AdminShowtimeValidationError(
      "Select a valid showroom.",
    );
  }

  const parsedStart =
    parseDateTimeLocal(input.startTime);

  if (!parsedStart) {
    throw new AdminShowtimeValidationError(
      "Select a valid date and start time.",
    );
  }

  const [movie, room] =
    await Promise.all([
      findMovieById(input.movieId),

      findTheaterRoomById(
        input.theaterRoomId,
      ),
    ]);

  if (!movie) {
    throw new AdminShowtimeValidationError(
      "The selected movie does not exist.",
      404,
    );
  }

  if (!room) {
    throw new AdminShowtimeValidationError(
      "The selected showroom does not exist.",
      404,
    );
  }

  if (
    !movie.runtimeMinutes ||
    movie.runtimeMinutes <= 0
  ) {
    throw new AdminShowtimeValidationError(
      "The selected movie needs a valid runtime before it can be scheduled.",
    );
  }

  const endTimestamp =
    parsedStart.timestamp +
    movie.runtimeMinutes * 60_000;

  const endTime =
    formatSqlDateTime(endTimestamp);

  const conflictingShowtime =
    await findShowtimeConflict(
      room.theaterRoomId,
      parsedStart.sqlValue,
      endTime,
    );

  if (conflictingShowtime) {
    throw new AdminShowtimeValidationError(
      `${room.roomName} already has ` +
        `${conflictingShowtime.movieTitle} scheduled from ` +
        `${conflictingShowtime.startTime} to ` +
        `${conflictingShowtime.endTime}.`,
      409,
    );
  }

  const showtimeId =
    await insertShowtime({
      movieId: movie.movieId,
      theaterRoomId:
        room.theaterRoomId,
      startTime:
        parsedStart.sqlValue,
      endTime,
      formatType: room.formatType,
    });

  const createdShowtime =
    await findShowtimeById(
      showtimeId,
    );

  if (!createdShowtime) {
    throw new Error(
      "The showtime was created but could not be reloaded.",
    );
  }

  return createdShowtime;
}