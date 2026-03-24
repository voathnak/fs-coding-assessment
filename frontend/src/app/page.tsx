"use client";

import { useEffect, useMemo, useState } from "react";

import { ConfirmModal } from "@/components/confirm-modal";
import { Header } from "@/components/header";
import { ProtectedRoute } from "@/components/protected-route";
import { TodoFilters } from "@/components/todo-filters";
import { TodoFormModal } from "@/components/todo-form-modal";
import { TodoResults } from "@/components/todo-results";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useTodos } from "@/context/todo-context";
import type { Todo } from "@/lib/types";

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
          <TodoFilters
            searchInput={searchInput}
            selectedPriority={query.priority}
            onSearchInputChange={setSearchInput}
            onPriorityChange={(priority) => setQuery({ ...query, page: 1, priority })}
            onCreateTodo={() => {
              setEditingTodo(undefined);
              setModalOpen(true);
            }}
          />

          <TodoResults
            todos={todos}
            me={user}
            isLoading={isLoading}
            pendingIds={pendingIds}
            page={query.page}
            canGoNext={canGoNext}
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
            onPageChange={(page) => setQuery({ ...query, page: Math.max(1, page) })}
          />
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
