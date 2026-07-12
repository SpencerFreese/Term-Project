import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findUserProfileById } from "@/lib/repositories/userRepository";
import LogoutButton from "../components/LogoutButton";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await findUserProfileById(session.userId);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            Customer Profile
          </p>
          <h1 className="text-4xl font-bold">
            Welcome, {user.firstName}
          </h1>
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

      <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-800">
        <h2 className="mb-4 text-2xl font-semibold">Account Information</h2>

        <div className="space-y-3 text-sm">
          <p>
            <strong>Name:</strong> {user.firstName} {user.lastName}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Phone:</strong> {user.phoneNumber ?? "Not added"}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      </section>
    </main>
  );
}