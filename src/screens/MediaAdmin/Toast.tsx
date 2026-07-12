import { useEffect } from "react";
import type { Toast as ToastType } from "./types";

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps): JSX.Element => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }): JSX.Element => {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 4000);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgColor = toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-[#1A1A1A]";

  return (
    <div className={`${bgColor} text-white px-4 py-3 text-xs font-medium shadow-lg flex items-center gap-3 min-w-[280px] animate-in slide-in-from-right`}>
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="text-white/70 hover:text-white transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
