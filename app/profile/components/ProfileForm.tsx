"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileFormProps = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  promoSubscribed: boolean;
};

export default function ProfileForm({
  email,
  firstName,
  lastName,
  phoneNumber,
  promoSubscribed,
}: ProfileFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName,
    lastName,
    phoneNumber: phoneNumber ?? "",
    promoSubscribed,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Profile could not be updated.");
        return;
      }

      setSuccess(
        data.message ??
          "Profile updated successfully. A confirmation email has been sent.",
      );
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-800">
      <h2 className="mb-1 text-2xl font-semibold">Account Information</h2>

      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Fields marked with <span className="text-red-500">*</span> are
        required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1 block text-sm font-medium"
            >
              First name <span className="text-red-500">*</span>
            </label>

            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
              required
              maxLength={50}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-1 block text-sm font-medium"
            >
              Last name <span className="text-red-500">*</span>
            </label>

            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  lastName: event.target.value,
                }))
              }
              required
              maxLength={50}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>

          <input
            id="email"
            value={email}
            disabled
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
          />

          <p className="mt-1 text-xs text-zinc-500">
            Your email address cannot be changed.
          </p>
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="mb-1 block text-sm font-medium"
          >
            Phone number
          </label>

          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                phoneNumber: event.target.value,
              }))
            }
            maxLength={20}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.promoSubscribed}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                promoSubscribed: event.target.checked,
              }))
            }
            className="mt-1"
          />

          <span>Send me promotional emails about movies and discounts.</span>
        </label>

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
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
