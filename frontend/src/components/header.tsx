"use client";

import { useAuth } from "@/context/auth-context";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">Todo App</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600" aria-label="Logged in user">
            {user?.username ?? "Unknown user"}
          </p>
          <button
            onClick={logout}
            className="rounded bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
