"use client";

export function PaginationControls({
  page,
  onPageChange,
  canGoNext,
}: {
  page: number;
  onPageChange: (page: number) => void;
  canGoNext: boolean;
}) {
  return (
    <nav className="mt-4 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm">Page {page}</span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoNext}
        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
}
