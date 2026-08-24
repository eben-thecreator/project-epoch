import React, { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  /** Snap heights in vh units, ascending. Default [34, 72]. */
  snaps?: number[];
  defaultSnapIndex?: number;
  /** Hide the titled header row for chrome-less content. */
  hideHeader?: boolean;
}

/**
 * The mobile atlas speaks in sheets. One docked panel rises from the
 * status bar in measured steps — peek to read the room, high to work —
 * dragged or tapped between snaps, closed with the rule's own grammar.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  label,
  children,
  snaps = [34, 72],
  defaultSnapIndex = 0,
  hideHeader = false,
}) => {
  const [snapIndex, setSnapIndex] = useState(() =>
    Math.min(defaultSnapIndex, snaps.length - 1)
  );

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const current = snapIndex;
    if (info.offset.y < -60 && current < snaps.length - 1) {
      setSnapIndex(current + 1);
    } else if (info.offset.y > 60 && current > 0) {
      setSnapIndex(current - 1);
    } else if (
      info.offset.y > 40 &&
      current === 0 &&
      info.velocity.y > 300
    ) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="atlas-sheet"
          role="dialog"
          aria-modal="false"
          aria-label={label}
          initial={{ y: "100%" }}
          animate={{ y: 0, height: `${snaps[snapIndex]}vh` }}
          exit={{ y: "105%" }}
          transition={{ type: "tween", duration: 0.32, ease: [0.59, 0.01, 0.28, 1] }}
          drag="y"
          dragElastic={{ top: 0.08, bottom: 0.35 }}
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={onDragEnd}
          className="map-chrome fixed inset-x-0 bottom-0 z-[1300] flex flex-col border-t border-hairline bg-white"
        >
          <button
            type="button"
            onClick={() => setSnapIndex((i) => (i > 0 ? i - 1 : i))}
            aria-label="Collapse sheet one step"
            className="flex w-full shrink-0 cursor-grab items-center justify-center pb-1 pt-2 active:cursor-grabbing"
          >
            <span aria-hidden="true" className="block h-[3px] w-10 bg-ink/20" />
          </button>

          {!hideHeader && (
            <div className="flex shrink-0 items-center justify-between border-b border-hairline pl-4 pr-2">
              <p className="f-caption py-2 uppercase tracking-[0.16em] text-ink-soft">
                {label}
              </p>
              <button
                onClick={onClose}
                aria-label={`Close ${label}`}
                className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors duration-200 ease-house hover:text-ink"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M1 1l10 10M11 1L1 11" />
                </svg>
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

BottomSheet.displayName = "BottomSheet";
