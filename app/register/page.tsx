"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    promoSubscribed: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function updateTextField(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

const responseText = await response.text();

let data: {
  error?: string;
  message?: string;
};

try {
  data = JSON.parse(responseText);
} catch {
  console.error("Non-JSON response:", responseText);

  setError(
    `The registration server returned an unexpected response (${response.status}). Check the pnpm dev terminal.`,
  );

  return;
}

if (!response.ok) {
  setError(data.error ?? `Registration failed (${response.status}).`);
  return;
}

setSuccess(
  data.message ??
    "Registration successful. Check your email to confirm your account.",
);

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        promoSubscribed: false,
      });
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-zinc-300 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-bold">Create an account</h1>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Register to purchase tickets, save favorite movies, and
          manage your profile.
        </p>

        <Link
          href="/"
          className="mb-4 inline-flex w-fit items-center text-sm font-medium text-sky-600 hover:underline"
        >
          Back to Home
        </Link>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={updateTextField}
              required
              maxLength={50}
              autoComplete="given-name"
            />

            <FormInput
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={updateTextField}
              required
              maxLength={50}
              autoComplete="family-name"
            />
          </div>

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateTextField}
            required
            maxLength={255}
            autoComplete="email"
          />

          <FormInput
            label="Phone number"
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={updateTextField}
            maxLength={20}
            autoComplete="tel"
            helperText="Optional"
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateTextField}
            required
            minLength={8}
            autoComplete="new-password"
            helperText="At least 8 characters with uppercase, lowercase, number, and special character."
          />

          <FormInput
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={updateTextField}
            required
            minLength={8}
            autoComplete="new-password"
          />

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

            <span>
              Send me promotional emails about movies and discounts.
            </span>
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

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-center font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || Boolean(success)}
              className="flex-1 rounded-lg bg-sky-600 px-4 py-3 font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-sky-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

type FormInputProps = {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  helperText?: string;
};

function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
  minLength,
  autoComplete,
  helperText,
}: FormInputProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium"
      >
        {label}

        {required && (
          <span className="text-red-500"> *</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />

      {helperText && (
        <p className="mt-1 text-xs text-zinc-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
