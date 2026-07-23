import {
  redirect,
} from "next/navigation";

import {
  getSession,
} from "@/lib/auth";

import {
  findMovies,
} from "@/lib/repositories/movieRepository";

import {
  findUpcomingScheduledShowtimes,
} from "@/lib/repositories/showtimeRepository";

import {
  findAllTheaterRooms,
} from "@/lib/repositories/theaterRoomRepository";

import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import ShowtimeForm from "./ShowtimeForm";

export const dynamic =
  "force-dynamic";

export default async function AdminShowtimesPage() {
  const session =
    await getSession();

  if (!session) {
    redirect("/login");
  }

  if (
    session.role !== "admin"
  ) {
    redirect("/");
  }

  const [
    movies,
    rooms,
    showtimes,
  ] = await Promise.all([
    findMovies(),
    findAllTheaterRooms(),
    findUpcomingScheduledShowtimes(),
  ]);

  const movieOptions =
    movies.map((movie) => ({
      movieId: movie.movieId,
      title: movie.title,

      runtimeMinutes:
        movie.runtimeMinutes,

      status: movie.status,
    }));

  const roomOptions =
    rooms.map((room) => ({
      theaterRoomId:
        room.theaterRoomId,

      roomName:
        room.roomName,

      formatType:
        room.formatType,

      seatCount:
        room.seatRows *
        room.seatCols,
    }));

  const upcomingShowtimes =
    showtimes.map(
      (showtime) => ({
        showtimeId:
          showtime.showtimeId,

        movieTitle:
          showtime.movieTitle,

        roomName:
          showtime.roomName,

        startTime:
          showtime.startTime,

        endTime:
          showtime.endTime,

        formatType:
          showtime.formatType,
      }),
    );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <AdminPageHeader
        title="Manage Showtimes"
        description="Select a movie, date, time, and showroom to schedule a new showing."
      />

      <ShowtimeForm
        movies={movieOptions}
        rooms={roomOptions}
        showtimes={
          upcomingShowtimes
        }
      />
    </main>
  );
}