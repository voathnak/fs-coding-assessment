export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TodoStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  username: string;
  email?: string | null;
  status: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: TodoStatus;
  priority?: Priority | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoDraft {
  title: string;
  description: string;
  priority?: Priority | null;
}
