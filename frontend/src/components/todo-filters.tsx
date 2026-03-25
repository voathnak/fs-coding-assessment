"use client";

import type { Priority } from "@/lib/types";

type TodoFiltersProps = {
  searchInput: string;
  selectedPriority?: Priority;
  onSearchInputChange: (value: string) => void;
  onPriorityChange: (priority?: Priority) => void;
  onCreateTodo: () => void;
};

export function TodoFilters({
  searchInput,
  selectedPriority,
  onSearchInputChange,
  onPriorityChange,
  onCreateTodo,
}: TodoFiltersProps) {
  return (
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
              onChange={(e) => onSearchInputChange(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Priority</span>
            <select
              aria-label="Filter by priority"
              className="w-full rounded border px-3 py-2"
              value={selectedPriority ?? ""}
              onChange={(e) => onPriorityChange((e.target.value || undefined) as Priority | undefined)}
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
          onClick={onCreateTodo}
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
        >
          New Todo
        </button>
      </div>
    </section>
  );
}
