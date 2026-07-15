"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const verification = searchParams.get("verification");

  const initialNotice =
    verification === "success"
      ? "Your email has been confirmed. You may now log in."
      : "";

  const initialError =
    verification === "invalid"
      ? "This confirmation link is invalid or has expired."
      : verification === "error"
        ? "Your account could not be confirmed. Please try again."
        : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState(initialNotice);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }

      router.replace(data.redirectTo);
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-zinc-300 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-2 text-3xl font-bold">Login</h1>

        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to manage your profile, favorites, and bookings.
        </p>
        <Link
          href="/"
          className="mb-4 inline-flex w-fit items-center text-sm font-medium text-sky-600 hover:underline"
        >
          Back to Home
        </Link>


        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
            >
              Email <span className="text-red-500">*</span>
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password <span className="text-red-500">*</span>
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              autoComplete="current-password"
            />
          </div>

          {notice && (
            <p
              role="status"
              className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800"
            >
              {notice}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-center font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <Link
            href="/forgot-password"
            className="block text-center text-sm text-sky-600 hover:underline"
          >
            Forgot your password?
          </Link>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Do not have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-sky-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <p>Loading login page...</p>
    </main>
  );
}