"use client";

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded border px-3 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded bg-red-600 px-3 py-2 text-sm text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
