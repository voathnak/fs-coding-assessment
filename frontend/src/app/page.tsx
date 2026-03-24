"use client";

import { useEffect, useMemo, useState } from "react";

import { ConfirmModal } from "@/components/confirm-modal";
import { Header } from "@/components/header";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedRoute } from "@/components/protected-route";
import { TodoFormModal } from "@/components/todo-form-modal";
import { TodoList } from "@/components/todo-list";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useTodos } from "@/context/todo-context";
import type { Priority, Todo } from "@/lib/types";

export default function Home() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { todos, isLoading, pendingIds, query, setQuery, refresh, createTodo, updateTodo, toggleTodo, deleteTodo } =
    useTodos();
  const [searchInput, setSearchInput] = useState(query.search ?? "");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    refresh().catch((error: Error) => showToast("error", error.message));
  }, [refresh, showToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      setQuery({
        ...query,
        page: 1,
        search: trimmed.length >= 2 ? trimmed : undefined,
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query, searchInput, setQuery]);

  const canGoNext = useMemo(() => todos.length >= 20, [todos.length]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl p-4">
          <section className="rounded border bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="grid gap-2 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block">Search title</span>
                  <input
                    aria-label="Search todo title"
                    className="w-full rounded border px-3 py-2"
                    placeholder="Min 2 chars..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block">Priority</span>
                  <select
                    aria-label="Filter by priority"
                    className="w-full rounded border px-3 py-2"
                    value={query.priority ?? ""}
                    onChange={(e) =>
                      setQuery({
                        ...query,
                        page: 1,
                        priority: (e.target.value || undefined) as Priority | undefined,
                      })
                    }
                  >
                    <option value="">All</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingTodo(undefined);
                  setModalOpen(true);
                }}
                className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
              >
                New Todo
              </button>
            </div>
          </section>

          <section className="mt-4">
            {isLoading ? (
              <p role="status" className="rounded border bg-white p-6 text-center text-sm">
                Loading todos...
              </p>
            ) : (
              <TodoList
                todos={todos}
                me={user}
                pendingIds={pendingIds}
                onToggle={(id) => toggleTodo(id).catch((error: Error) => showToast("error", error.message))}
                onEdit={(todo) => {
                  if (todo.user_id !== user?.id) return;
                  setEditingTodo(todo);
                  setModalOpen(true);
                }}
                onDelete={(todo) => {
                  if (todo.user_id !== user?.id) return;
                  setDeletingTodo(todo);
                }}
              />
            )}
            <PaginationControls
              page={query.page}
              canGoNext={canGoNext}
              onPageChange={(page) => setQuery({ ...query, page: Math.max(1, page) })}
            />
          </section>
        </main>
      </div>

      <TodoFormModal
        open={isModalOpen}
        initialTodo={editingTodo}
        onClose={() => setModalOpen(false)}
        onSave={async (payload) => {
          if (editingTodo) await updateTodo(editingTodo.id, payload);
          else await createTodo(payload);
        }}
      />
      <ConfirmModal
        open={Boolean(deletingTodo)}
        title="Delete todo?"
        message={`This action will permanently remove "${deletingTodo?.title ?? ""}".`}
        onCancel={() => setDeletingTodo(null)}
        onConfirm={() => {
          if (!deletingTodo) return;
          deleteTodo(deletingTodo.id)
            .catch((error: Error) => showToast("error", error.message))
            .finally(() => setDeletingTodo(null));
        }}
      />
    </ProtectedRoute>
  );
}
