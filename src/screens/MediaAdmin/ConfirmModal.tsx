import { useRef } from "react";
import { motion } from "framer-motion";
import { useFocusTrap } from "../../lib/useFocusTrap";

interface ConfirmModalProps {
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  title,
  body,
  confirmLabel,
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps): JSX.Element => {
  const sheetRef = useRef<HTMLDivElement>(null);
  useFocusTrap(sheetRef, true, onCancel);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/40 p-4" onClick={onCancel}>
      <motion.div
        ref={sheetRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative bg-white border border-hairline w-full max-w-[400px]"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-5">
          <p className="text-[13px] text-ink-soft mb-1">Please confirm</p>
          <h3 className="f-heading-5 text-ink">{title}</h3>
          <p className="text-[13px] leading-relaxed text-ink-soft mt-2">{body}</p>
        </div>
        <div className="px-6 py-4 border-t border-hairline flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="f-caption px-4 py-2 border border-ink/15 hover:border-ink text-ink transition-colors duration-200 ease-house"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              destructive
                ? "f-caption px-4 py-2 border border-brand/40 text-brand hover:border-brand hover:bg-brand/5 transition-colors duration-200 ease-house"
                : "f-caption px-4 py-2 bg-ink text-white hover:bg-ink/80 transition-colors duration-200 ease-house"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
