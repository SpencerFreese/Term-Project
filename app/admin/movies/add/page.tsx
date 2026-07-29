import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getAllGenres,
} from "@/lib/services/genreService";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import MovieForm from "../components/MovieForm";

export const dynamic = "force-dynamic";

export default async function AddMoviePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/");
  }

  const genres = await getAllGenres();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <AdminPageHeader
        title="Add Movie"
        description="Enter the movie information and save it to the database."
        backHref="/admin/movies"
      />

      <MovieForm
        mode="add"
        genres={genres}
      />
    </main>
  );
}