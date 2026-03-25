"use client";

import { useEffect, useMemo, useState } from "react";

import type { Priority, Todo } from "@/lib/types";
import { validateTodoTitle } from "@/lib/validators";

type Props = {
  open: boolean;
  initialTodo?: Todo;
  onClose: () => void;
  onSave: (payload: { title: string; description: string; priority?: Priority | null }) => Promise<void>;
};

export function TodoFormModal({ open, initialTodo, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTodo?.title ?? "");
    setDescription(initialTodo?.description ?? "");
    setPriority((initialTodo?.priority as Priority | undefined) ?? "");
  }, [initialTodo, open]);

  const titleError = useMemo(() => validateTodoTitle(title), [title]);
  const isDirty =
    title !== (initialTodo?.title ?? "") ||
    description !== (initialTodo?.description ?? "") ||
    priority !== ((initialTodo?.priority as Priority | undefined) ?? "");

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty || !open) return;
      e.preventDefault();
      e.returnValue = "";
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (isDirty && !window.confirm("Discard unsaved changes?")) return;
        onClose();
      }
    };
    window.addEventListener("beforeunload", handler);
    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("beforeunload", handler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [isDirty, open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <form
        className="w-full max-w-lg rounded bg-white p-4 shadow"
        onSubmit={async (e) => {
          e.preventDefault();
          if (titleError) return;
          setSubmitting(true);
          try {
            await onSave({
              title: title.trim(),
              description,
              priority: priority || null,
            });
            onClose();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <h2 className="text-lg font-semibold">{initialTodo ? "Edit Todo" : "Create Todo"}</h2>
        <label className="mt-4 block text-sm font-medium" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="mt-1 w-full rounded border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
        {titleError ? <p className="mt-1 text-xs text-red-600">{titleError}</p> : null}

        <label className="mt-4 block text-sm font-medium" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="mt-1 min-h-28 w-full rounded border px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="priority">
          Priority
        </label>
        <select
          id="priority"
          className="mt-1 w-full rounded border px-3 py-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority | "")}
        >
          <option value="">None</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              if (isDirty && !window.confirm("Discard unsaved changes?")) return;
              onClose();
            }}
            className="rounded border px-3 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={Boolean(titleError) || submitting}
            className="rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
