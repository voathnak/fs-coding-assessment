"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { validateEmail, validatePassword, validateUsername } from "@/lib/validators";

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const usernameError = validateUsername(username);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 p-4">
      <form
        className="w-full max-w-md rounded border bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          if (usernameError || emailError || passwordError) return;
          setSubmitting(true);
          try {
            await register({
              username,
              email: email || undefined,
              password,
            });
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Registration failed";
            showToast("error", message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="mt-1 text-sm text-gray-600">Create your account.</p>

        <label className="mt-4 block text-sm font-medium" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="mt-1 w-full rounded border px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        {usernameError ? <p className="mt-1 text-xs text-red-600">{usernameError}</p> : null}

        <label className="mt-4 block text-sm font-medium" htmlFor="email">
          Email (optional)
        </label>
        <input
          id="email"
          type="email"
          className="mt-1 w-full rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="mt-1 w-full rounded border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        {passwordError ? <p className="mt-1 text-xs text-red-600">{passwordError}</p> : null}

        <button
          type="submit"
          disabled={Boolean(usernameError || emailError || passwordError || isSubmitting)}
          className="mt-5 w-full rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link className="text-blue-600 underline" href="/login">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
