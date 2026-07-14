"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AddressFormProps = {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
};

const EMPTY_ADDRESS = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "US",
};

export default function AddressForm({ address }: AddressFormProps) {
  const router = useRouter();

  const [form, setForm] = useState(address ?? EMPTY_ADDRESS);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/profile/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Address could not be saved.");
        return;
      }

      setSuccess(data.message ?? "Address saved successfully.");
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setError("");
    setSuccess("");
    setRemoving(true);

    try {
      const response = await fetch("/api/profile/address", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Address could not be removed.");
        return;
      }

      setForm(EMPTY_ADDRESS);
      setSuccess(data.message ?? "Address removed.");
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-800">
      <h2 className="mb-1 text-2xl font-semibold">Address</h2>

      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        You may store one address on your account. Fields marked with{" "}
        <span className="text-red-500">*</span> are required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="street" className="mb-1 block text-sm font-medium">
            Street <span className="text-red-500">*</span>
          </label>

          <input
            id="street"
            required
            maxLength={255}
            value={form.street}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                street: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium">
              City <span className="text-red-500">*</span>
            </label>

            <input
              id="city"
              required
              maxLength={100}
              value={form.city}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label htmlFor="state" className="mb-1 block text-sm font-medium">
              State <span className="text-red-500">*</span>
            </label>

            <input
              id="state"
              required
              maxLength={100}
              value={form.state}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  state: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="zipCode"
              className="mb-1 block text-sm font-medium"
            >
              Zip code <span className="text-red-500">*</span>
            </label>

            <input
              id="zipCode"
              required
              maxLength={20}
              value={form.zipCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  zipCode: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="mb-1 block text-sm font-medium"
            >
              Country
            </label>

            <input
              id="country"
              maxLength={100}
              value={form.country}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  country: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save address"}
          </button>

          {address && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:hover:bg-red-950/30"
            >
              {removing ? "Removing..." : "Remove address"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
