"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error";
type Toast = { id: number; type: ToastType; message: string };

const ToastContext = createContext<{ showToast: (type: ToastType, message: string) => void } | null>(
  null,
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite" role="status">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-md px-4 py-2 text-sm text-white shadow ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
