import { clearToken, getToken } from "./auth";
import type { AuthToken, Priority, Todo, TodoDraft, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestInitExt = RequestInit & { retry?: number };

async function request<T>(path: string, init: RequestInitExt = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearToken();
      }
      let detail = "Request failed";
      try {
        const body = await response.json();
        detail = body.detail ?? detail;
      } catch {}
      throw new ApiError(detail, response.status);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    const retries = init.retry ?? 1;
    const retryable = error instanceof TypeError || (error instanceof ApiError && error.status >= 500);
    if (retries > 0 && retryable) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return request<T>(path, { ...init, retry: retries - 1 });
    }
    throw error;
  }
}

export const api = {
  register: (input: { username: string; password: string; email?: string }) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  login: (input: { username: string; password: string }) =>
    request<AuthToken>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  me: () => request<User>("/users/me"),
  listTodos: (query: { page: number; page_size: number; priority?: Priority; search?: string }) => {
    const params = new URLSearchParams({
      page: String(query.page),
      page_size: String(query.page_size),
    });
    if (query.priority) params.set("priority", query.priority);
    if (query.search) params.set("search", query.search);
    return request<Todo[]>(`/todos?${params.toString()}`);
  },
  createTodo: (input: TodoDraft) =>
    request<Todo>("/todos", { method: "POST", body: JSON.stringify(input) }),
  updateTodo: (id: string, input: Partial<TodoDraft>) =>
    request<Todo>(`/todos/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  toggleTodo: (id: string) => request<Todo>(`/todos/${id}/complete`, { method: "PATCH" }),
  deleteTodo: (id: string) => request<void>(`/todos/${id}`, { method: "DELETE" }),
};
