"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/context/toast-context";
import { TodoProvider } from "@/context/todo-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <TodoProvider>{children}</TodoProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
