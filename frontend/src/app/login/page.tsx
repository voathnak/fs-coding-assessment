"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { validatePassword, validateUsername } from "@/lib/validators";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const usernameError = validateUsername(username);
  const passwordError = validatePassword(password);

  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 p-4">
      <form
        className="w-full max-w-md rounded border bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          if (usernameError || passwordError) return;
          setSubmitting(true);
          try {
            await login(username, password);
          } catch {
            showToast("error", "Invalid username or password");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-gray-600">Sign in to manage your todos.</p>

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

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="mt-1 w-full rounded border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {passwordError ? <p className="mt-1 text-xs text-red-600">{passwordError}</p> : null}

        <button
          type="submit"
          disabled={Boolean(usernameError || passwordError || isSubmitting)}
          className="mt-5 w-full rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <p className="mt-4 text-sm">
          No account?{" "}
          <Link className="text-blue-600 underline" href="/register">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}
