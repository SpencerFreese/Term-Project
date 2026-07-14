"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type MaskedCard = {
  cardId: number;
  cardholderName: string;
  cardType: string | null;
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
};

const EMPTY_CARD = {
  cardNumber: "",
  cardholderName: "",
  expiryMonth: "",
  expiryYear: "",
};

const MAX_CARDS = 3;

export default function PaymentCardsForm({
  cards,
}: {
  cards: MaskedCard[];
}) {
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_CARD);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const atLimit = cards.length >= MAX_CARDS;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/profile/payment-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Payment card could not be saved.");
        return;
      }

      setSuccess(data.message ?? "Payment card added successfully.");
      setForm(EMPTY_CARD);
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(cardId: number) {
    setError("");
    setSuccess("");
    setRemovingId(cardId);

    try {
      const response = await fetch(`/api/profile/payment-cards/${cardId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Payment card could not be removed.");
        return;
      }

      setSuccess(data.message ?? "Payment card removed.");
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-800">
      <h2 className="mb-1 text-2xl font-semibold">Payment Cards</h2>

      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        You may store up to {MAX_CARDS} payment cards. Card numbers are
        encrypted before being saved.
      </p>

      {cards.length > 0 && (
        <ul className="mb-6 space-y-3">
          {cards.map((card) => (
            <li
              key={card.cardId}
              className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
            >
              <div>
                <p className="font-semibold">
                  {card.cardType ?? "Card"} •••• {card.lastFour}
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {card.cardholderName} · Expires {card.expiryMonth}/
                  {card.expiryYear}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(card.cardId)}
                disabled={removingId === card.cardId}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:hover:bg-red-950/30"
              >
                {removingId === card.cardId ? "Removing..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800"
        >
          {success}
        </p>
      )}

      {atLimit ? (
        <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          You have reached the maximum of {MAX_CARDS} saved cards. Remove a
          card to add a new one.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Add a card
          </h3>

          <div>
            <label
              htmlFor="cardNumber"
              className="mb-1 block text-sm font-medium"
            >
              Card number <span className="text-red-500">*</span>
            </label>

            <input
              id="cardNumber"
              required
              inputMode="numeric"
              autoComplete="cc-number"
              value={form.cardNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cardNumber: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="cardholderName"
              className="mb-1 block text-sm font-medium"
            >
              Cardholder name <span className="text-red-500">*</span>
            </label>

            <input
              id="cardholderName"
              required
              autoComplete="cc-name"
              value={form.cardholderName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cardholderName: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="expiryMonth"
                className="mb-1 block text-sm font-medium"
              >
                Expiry month (MM) <span className="text-red-500">*</span>
              </label>

              <input
                id="expiryMonth"
                required
                placeholder="MM"
                inputMode="numeric"
                maxLength={2}
                autoComplete="cc-exp-month"
                value={form.expiryMonth}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expiryMonth: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label
                htmlFor="expiryYear"
                className="mb-1 block text-sm font-medium"
              >
                Expiry year (YYYY) <span className="text-red-500">*</span>
              </label>

              <input
                id="expiryYear"
                required
                placeholder="YYYY"
                inputMode="numeric"
                maxLength={4}
                autoComplete="cc-exp-year"
                value={form.expiryYear}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expiryYear: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add card"}
          </button>
        </form>
      )}
    </section>
  );
}
