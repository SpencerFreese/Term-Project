import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "../components/LogoutButton";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            Admin Portal
          </p>
          <h1 className="text-4xl font-bold">Welcome, Admin</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Home
          </Link>

          <LogoutButton />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/movies" className="rounded-2xl border border-zinc-300 p-6 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
          <h2 className="text-xl font-semibold">Manage Movies</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add, update, or remove movies.
          </p>
        </Link>

        <Link href="/admin/promotions" className="rounded-2xl border border-zinc-300 p-6 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
          <h2 className="text-xl font-semibold">Promotions</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage promotion codes and discounts.
          </p>
        </Link>

        <Link href="/admin/users" className="rounded-2xl border border-zinc-300 p-6 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            View and manage user accounts.
          </p>
        </Link>

        <Link href="/admin/showtimes" className="rounded-2xl border border-zinc-300 p-6 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
          <h2 className="text-xl font-semibold">Showtimes</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage movie showtimes.
          </p>
        </Link>
      </section>
    </main>
  );
}