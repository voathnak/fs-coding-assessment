"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { api } from "@/lib/api";
import type { Priority, Todo, TodoDraft } from "@/lib/types";
import { useToast } from "./toast-context";

type TodoQuery = { page: number; priority?: Priority; search?: string };
type TodoContextValue = {
  todos: Todo[];
  isLoading: boolean;
  pendingIds: Set<string>;
  query: TodoQuery;
  setQuery: (query: TodoQuery) => void;
  refresh: () => Promise<void>;
  createTodo: (draft: TodoDraft) => Promise<void>;
  updateTodo: (id: string, draft: Partial<TodoDraft>) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
};

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState<TodoQuery>({ page: 1 });
  const { showToast } = useToast();

  const markPending = (id: string, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.listTodos({
        page: query.page,
        page_size: 20,
        priority: query.priority,
        search: query.search,
      });
      setTodos(data);
    } finally {
      setIsLoading(false);
    }
  }, [query.page, query.priority, query.search]);

  const createTodo = useCallback(
    async (draft: TodoDraft) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: Todo = {
        id: tempId,
        user_id: "optimistic",
        title: draft.title,
        description: draft.description,
        status: "NOT_STARTED",
        priority: draft.priority ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTodos((prev) => [optimistic, ...prev]);
      markPending(tempId, true);
      try {
        const created = await api.createTodo(draft);
        setTodos((prev) => [created, ...prev.filter((t) => t.id !== tempId)]);
        showToast("success", "Todo created");
      } catch (error) {
        setTodos((prev) => prev.filter((t) => t.id !== tempId));
        throw error;
      } finally {
        markPending(tempId, false);
      }
    },
    [showToast],
  );

  const updateTodo = useCallback(
    async (id: string, draft: Partial<TodoDraft>) => {
      const previous = todos;
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...draft } : todo)));
      markPending(id, true);
      try {
        const updated = await api.updateTodo(id, draft);
        setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
        showToast("success", "Todo updated");
      } catch (error) {
        setTodos(previous);
        throw error;
      } finally {
        markPending(id, false);
      }
    },
    [showToast, todos],
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      const previous = todos;
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? { ...todo, status: todo.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED" }
            : todo,
        ),
      );
      markPending(id, true);
      try {
        const updated = await api.toggleTodo(id);
        setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
      } catch (error) {
        setTodos(previous);
        throw error;
      } finally {
        markPending(id, false);
      }
    },
    [todos],
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      const previous = todos;
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      markPending(id, true);
      try {
        await api.deleteTodo(id);
        showToast("success", "Todo deleted");
      } catch (error) {
        setTodos(previous);
        throw error;
      } finally {
        markPending(id, false);
      }
    },
    [showToast, todos],
  );

  const value = useMemo(
    () => ({
      todos,
      isLoading,
      pendingIds,
      query,
      setQuery,
      refresh,
      createTodo,
      updateTodo,
      toggleTodo,
      deleteTodo,
    }),
    [createTodo, deleteTodo, isLoading, pendingIds, query, refresh, todos, toggleTodo, updateTodo],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodos must be used inside TodoProvider");
  return ctx;
}
