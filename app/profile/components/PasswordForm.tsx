"use client";

import { useState } from "react";

const EMPTY_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export default function PasswordForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Password could not be changed.");
        return;
      }

      setSuccess(data.message ?? "Password changed successfully.");
      setForm(EMPTY_FORM);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-800">
      <h2 className="mb-1 text-2xl font-semibold">Change Password</h2>

      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Fields marked with <span className="text-red-500">*</span> are
        required. You must confirm your current password to set a new one.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="currentPassword"
            className="mb-1 block text-sm font-medium"
          >
            Current password <span className="text-red-500">*</span>
          </label>

          <input
            id="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currentPassword: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="mb-1 block text-sm font-medium"
          >
            New password <span className="text-red-500">*</span>
          </label>

          <input
            id="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                newPassword: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />

          <p className="mt-1 text-xs text-zinc-500">
            At least 8 characters with uppercase, lowercase, number, and
            special character.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmNewPassword"
            className="mb-1 block text-sm font-medium"
          >
            Confirm new password <span className="text-red-500">*</span>
          </label>

          <input
            id="confirmNewPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.confirmNewPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                confirmNewPassword: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
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
          <p
            role="status"
            className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800"
          >
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Change password"}
        </button>
      </form>
    </section>
  );
}
