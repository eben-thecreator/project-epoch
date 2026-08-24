import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { useFocusTrap } from "../../../lib/useFocusTrap";

interface ChipGroupProps {
  title: string;
  options: Array<{ value: string; count?: number }>;
  selected: string[];
  swatchOf?: (value: string) => string | undefined;
  onToggle: (value: string) => void;
}

/** The house toggle chip — outlined dot that fills ink when live. */
const ChipGroup: React.FC<ChipGroupProps> = ({
  title,
  options,
  selected,
  swatchOf,
  onToggle,
}) => (
  <fieldset className="border-t border-hairline px-5 py-5">
    <legend className="f-caption uppercase tracking-[0.16em] text-ink-soft">
      {title}
    </legend>
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2.5">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        const swatch = swatchOf?.(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(opt.value)}
            className={cn(
              "group inline-flex items-center gap-[7px] text-left transition-colors duration-200 ease-house",
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            )}
          >
            <span
              aria-hidden="true"
              className="flex shrink-0 items-center justify-center"
            >
              {swatch ? (
                <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="22" height="22" fill="#1A1A1A" />
                  <rect x="2" y="2" width="20" height="20" fill="none"
                    stroke={active ? swatch : "#767676"} strokeWidth="1.5" />
                </svg>
              ) : (
                <span
                  className={cn(
                    "block h-2.5 w-2.5 shrink-0 rounded-full border transition-colors duration-200 ease-house",
                    active ? "border-ink bg-ink" : "border-ink-soft group-hover:border-ink"
                  )}
                />
              )}
            </span>
            <span className="f-caption">{opt.value}</span>
            {opt.count !== undefined && (
              <span className="f-number tabular-nums opacity-50">
                ({opt.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  </fieldset>
);

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, value, onChange }) => {
  const [lo, hi] = value;
  const pct = (v: number) =>
    max === min ? 0 : ((v - min) / (max - min)) * 100;

  return (
    <div className="mt-4 px-0.5">
      <div className="flex items-baseline justify-between">
        <span className="f-number tabular-nums text-ink">{lo}</span>
        <span className="f-caption uppercase tracking-[0.14em] text-ink-soft">
          Period
        </span>
        <span className="f-number tabular-nums text-ink">{hi}</span>
      </div>
      <div className="relative mt-2.5 h-6">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white-line" />
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-brand"
          style={{ left: `${pct(lo)}%`, width: `${Math.max(pct(hi) - pct(lo), 2)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={lo}
          aria-label="Period start year"
          onChange={(e) =>
            onChange([Math.min(Number(e.target.value), hi - 10), hi])
          }
          className="atlas-range absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={hi}
          aria-label="Period end year"
          onChange={(e) =>
            onChange([lo, Math.max(Number(e.target.value), lo + 10)])
          }
          className="atlas-range atlas-range-upper absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent"
        />
      </div>
    </div>
  );
};

const ATTRIBUTE_SECTIONS: Array<{ key: string; title: string }> = [
  { key: "region", title: "Region" },
  { key: "condition", title: "Condition" },
  { key: "ownership", title: "Ownership" },
  { key: "conservation_status", title: "Conservation status" },
  { key: "material", title: "Material" },
  { key: "cultural_group", title: "Cultural association" },
];

const selectedValues = (raw?: string): string[] =>
  raw ? raw.split(",").filter(Boolean) : [];

export interface FilterBodyProps {
  categories: Array<{ value: string; count?: number }>;
  hiddenCategories: string[];
  onToggleCategory: (category: string) => void;
  categoryColorOf?: (value: string) => string | undefined;
  attributeOptions: Record<string, Array<{ value: string; count?: number }>>;
  filters: Record<string, string>;
  onToggleFilterValue: (key: string, value: string) => void;
  periodBounds: { min: number; max: number };
  yearRange: [number, number];
  onYearRangeChange: (r: [number, number]) => void;
  onClearAll: () => void;
  onDone: () => void;
}

/**
 * Every question a catalogue query can ask, in one scrollable column.
 * Shared by the desktop drawer and the mobile sheet.
 */
export const FilterBody: React.FC<FilterBodyProps> = ({
  categories,
  hiddenCategories,
  onToggleCategory,
  categoryColorOf,
  attributeOptions,
  filters,
  onToggleFilterValue,
  periodBounds,
  yearRange,
  onYearRangeChange,
  onClearAll,
  onDone,
}) => {
  const yearsPinned =
    yearRange[0] !== periodBounds.min || yearRange[1] !== periodBounds.max;

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <ChipGroup
          title="Asset type"
          options={categories}
          selected={categories
            .map((c) => c.value)
            .filter((c) => !hiddenCategories.includes(c))}
          swatchOf={categoryColorOf}
          onToggle={onToggleCategory}
        />

        <div className="border-t border-hairline px-5 py-5">
          <RangeSlider
            min={periodBounds.min}
            max={periodBounds.max}
            value={yearRange}
            onChange={onYearRangeChange}
          />
          {yearsPinned && (
            <button
              onClick={() =>
                onYearRangeChange([periodBounds.min, periodBounds.max])
              }
              className="f-caption mt-2 text-brand transition-opacity hover:opacity-60"
            >
              Restore full span
            </button>
          )}
        </div>

        {ATTRIBUTE_SECTIONS.map(({ key, title }) => {
          const options = attributeOptions[key] ?? [];
          if (options.length === 0) return null;
          return (
            <ChipGroup
              key={key}
              title={title}
              options={options}
              selected={selectedValues(filters[key])}
              onToggle={(v) => onToggleFilterValue(key, v)}
            />
          );
        })}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-hairline px-5 py-3">
        <button
          onClick={onClearAll}
          className="f-caption text-brand transition-opacity duration-200 hover:opacity-60"
        >
          Clear all
        </button>
        <button
          onClick={onDone}
          className="f-caption bg-ink px-5 py-2 text-white transition-colors duration-200 ease-house hover:bg-brand"
        >
          Show results
        </button>
      </div>
    </>
  );
};

export interface FilterDrawerProps extends Omit<
  FilterBodyProps,
  "onDone"
> {
  open: boolean;
  onClose: () => void;
}

/**
 * The research desk — a drawer that slides over the canvas' west edge.
 * The canvas stays untouched until a filter bites.
 */
export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onClose,
  ...body
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, onClose);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-hidden="true"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.59, 0.01, 0.28, 1] }}
            onClick={onClose}
            className="absolute inset-0 z-[1100] cursor-default bg-ink/10"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filter heritage records"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.32, ease: [0.59, 0.01, 0.28, 1] }}
            className="map-chrome absolute inset-y-0 left-0 z-[1101] flex w-full flex-col border-r border-hairline bg-white sm:w-[380px]"
          >
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-hairline pl-5 pr-3">
              <p className="f-caption uppercase tracking-[0.16em] text-ink-soft">
                Filters
              </p>
              <button
                onClick={onClose}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center text-ink-soft transition-colors duration-200 ease-house hover:text-ink"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M1 1l10 10M11 1L1 11" />
                </svg>
              </button>
            </div>

            <FilterBody {...body} onDone={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

FilterDrawer.displayName = "FilterDrawer";
