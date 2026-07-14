"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

type TokenStatus =  "checking" | "valid" | "expired" | "error";


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}






function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("checking");
  

  useEffect(() => {
    let cancelled = false;

    async function checkResetToken() {
      if (!token) {
        setTokenStatus("expired");
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (response.ok && data.valid === true) {
          setTokenStatus("valid");
          return;
        }

        if (
          response.status === 400 ||
          response.status === 410
        ) {
          setTokenStatus("expired");
          return;
        }

        setTokenStatus("error");
      } catch {
        if (!cancelled) {
          setTokenStatus("error");
        }
      }
    }
    void checkResetToken();

    return () => {
      cancelled = true;
    };
  }, [token]);



  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();


      if (!response.ok) {
        
        if (response.status === 410) {
          setTokenStatus("expired");
          return;
        }

        setError(
          data.error ?? "Password reset failed.",
        );
        return;
      }

      setSuccess(data.message);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }


  if (tokenStatus === "checking") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
          <div className="rounded-2xl border border-zinc-300 p-8 dark:border-zinc-800">
            <h1>
              Reset Password
            </h1>
            <p>
              Checking reset link...
            </p>
        </div>
      </main>
    );
  }


  if (tokenStatus === "expired") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="rounded-2xl border border-zinc-300 p-8 dark:border-zinc-800">
          <h1 className="text-2xl font-bold">
            Invalid Reset Link
          </h1>

          <p className="mt-3 text-sm text-red-600">
            This reset link has expired or is no longer valid
          </p>

          <Link
            href="/forgot-password"
            className="mt-6 inline-block text-sky-600 hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </main>
    );
  }

 if (tokenStatus === "error") {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-zinc-300 p-8 dark:border-zinc-800">
        <h1>
          Unable to Check Reset Link
        </h1>

        <p>
          Could not validate the reset link. Please try again.
        </p>
        
      </div>
    </main>
  );
}

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <Link
        href="/login"
        className="mb-4 inline-flex w-fit text-sm font-medium text-sky-600 hover:underline"
      >
        ← Back to Login
      </Link>

      <div className="rounded-2xl border border-zinc-300 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-bold">
          Reset Password
        </h1>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Enter a new password for your account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              New Password{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />

            <p className="mt-1 text-xs text-zinc-500">
              At least 8 characters with uppercase,
              lowercase, number, and special character.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium"
            >
              Confirm New Password{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <div
              role="status"
              className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800"
            >
              <p>{success}</p>

              <Link
                href="/login"
                className="mt-2 inline-block font-semibold text-sky-700 hover:underline"
              >
                Return to Login
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-full rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

function ResetPasswordLoading() {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <p>Loading password reset form...</p>
    </main>
  );
}