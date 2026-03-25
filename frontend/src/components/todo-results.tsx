"use client";

import { PaginationControls } from "@/components/pagination-controls";
import { TodoList } from "@/components/todo-list";
import type { Todo, User } from "@/lib/types";

type TodoResultsProps = {
  todos: Todo[];
  me: User | null;
  isLoading: boolean;
  pendingIds: Set<string>;
  page: number;
  canGoNext: boolean;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onPageChange: (page: number) => void;
};

export function TodoResults({
  todos,
  me,
  isLoading,
  pendingIds,
  page,
  canGoNext,
  onToggle,
  onEdit,
  onDelete,
  onPageChange,
}: TodoResultsProps) {
  return (
    <section className="mt-4">
      {isLoading ? (
        <p role="status" className="rounded border bg-white p-6 text-center text-sm">
          Loading todos...
        </p>
      ) : (
        <TodoList todos={todos} me={me} pendingIds={pendingIds} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      )}
      <PaginationControls page={page} canGoNext={canGoNext} onPageChange={onPageChange} />
    </section>
  );
}
