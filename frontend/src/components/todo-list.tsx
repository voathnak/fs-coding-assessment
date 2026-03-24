"use client";

import type { Todo, User } from "@/lib/types";

function priorityBadgeClass(priority?: string | null) {
  if (priority === "HIGH") return "bg-red-100 text-red-700";
  if (priority === "MEDIUM") return "bg-yellow-100 text-yellow-700";
  if (priority === "LOW") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
}

export function TodoList({
  todos,
  me,
  pendingIds,
  onToggle,
  onEdit,
  onDelete,
}: {
  todos: Todo[];
  me: User | null;
  pendingIds: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}) {
  if (todos.length === 0) {
    return <p className="rounded border border-dashed p-6 text-center text-sm text-gray-600">No todos found.</p>;
  }

  return (
    <ul className="space-y-3" aria-label="Todo list">
      {todos.map((todo) => {
        const isOwner = todo.user_id === me?.id;
        const isPending = pendingIds.has(todo.id);
        return (
          <li key={todo.id} className={`rounded border p-4 ${isPending ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{todo.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{todo.description || "No description"}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className={`rounded px-2 py-1 ${priorityBadgeClass(todo.priority)}`}>
                    {todo.priority ?? "NONE"}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1">{todo.status}</span>
                </div>
              </div>
              {isOwner ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(todo.id)}
                    className="rounded border px-2 py-1 text-sm"
                    disabled={isPending}
                    aria-label={`Toggle completion for ${todo.title}`}
                  >
                    {todo.status === "COMPLETED" ? "Uncomplete" : "Complete"}
                  </button>
                  <button type="button" onClick={() => onEdit(todo)} className="rounded border px-2 py-1 text-sm">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(todo)}
                    className="rounded border border-red-300 px-2 py-1 text-sm text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
