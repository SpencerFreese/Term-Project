import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "../components/LogoutButton";
import Link from "next/link";

function AdminMenuCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href?: string;
}) {
  const className =
    "rounded-2xl border border-zinc-300 p-6 dark:border-zinc-800";

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} hover:bg-zinc-100 dark:hover:bg-zinc-900`}
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </Link>
    );
  }

  return (
    <div
      aria-disabled="true"
      className={`${className} cursor-not-allowed opacity-70`}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

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
        <AdminMenuCard
          title="Manage Movies"
          description="Add, update, or remove movies."
          href="/admin/movies"
        />

        <AdminMenuCard
          title="Promotions"
          description="Optional bonus feature. Not included in this deliverable."
        />

        <AdminMenuCard
          title="Users"
          description="User management is not required for this deliverable."
        />

        <AdminMenuCard
          title="Showtimes"
          description="Manage movie showtimes."
          href="/admin/showtimes"
        />
      </section>
    </main>
  );
}
