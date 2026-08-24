import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import type { Toast as ToastType } from "./types";

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps): JSX.Element => {
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }): JSX.Element => {
  const [leaving, setLeaving] = useState(false);
  const isError = toast.type === "error";

  useEffect(() => {
    const life = isError ? 6000 : 4000;
    const t1 = window.setTimeout(() => setLeaving(true), life - 300);
    const t2 = window.setTimeout(() => onDismiss(toast.id), life);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [toast.id, toast.type, onDismiss]);

  return (
    <div
      role={isError ? "alert" : undefined}
      className={cn(
        "bg-white border border-hairline flex items-stretch min-w-[280px] max-w-sm",
        "transition-all duration-300 ease-house",
        leaving ? "opacity-0 translate-x-3" : "opacity-100 translate-x-0"
      )}
    >
      <span aria-hidden="true" className={cn("w-[3px] shrink-0", isError ? "bg-brand" : "bg-ink")} />
      <div className="flex items-start gap-2.5 px-3.5 py-3 flex-1 min-w-0">
        {isError ? (
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5 mt-[3px] shrink-0 text-brand"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
            <path strokeLinecap="round" strokeWidth={1.5} d="M12 8v4.5M12 15.5v.5" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5 mt-[3px] shrink-0 text-ink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.5l5 5L19.5 7" />
          </svg>
        )}
        <span className="f-caption text-ink leading-snug flex-1">{toast.message}</span>
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="shrink-0 p-0.5 text-ink/35 hover:text-ink transition-colors duration-200 ease-house"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
