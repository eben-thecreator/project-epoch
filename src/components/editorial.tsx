import { cn } from "../lib/utils";

/**
 * Editorial micro-primitives — the instrument voice of the archive.
 * Sparse by design: parentheses labels, hairline rules, tabular data.
 */

/** A parenthesised section label, e.g. "( KEY DETAILS )". */
export const SectionLabel = ({
  children,
  dark = false,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}): JSX.Element => (
  <p
    className={cn(
      "font-mono text-[9px] uppercase tracking-[0.28em]",
      dark ? "text-paper/40" : "text-ink/45",
      className
    )}
  >
    ( {children} )
  </p>
);

interface MetaRowProps {
  label: string;
  value?: string | null;
  dark?: boolean;
  /** Render the value in the mono voice (coordinates, years, counts). */
  mono?: boolean;
}

/**
 * One hairline definition row. The single way metadata is typeset across
 * the catalogue, the profile and the atlas -- data never appears boxed.
 */
export const MetaRow = ({
  label,
  value,
  dark = false,
  mono = false,
}: MetaRowProps): JSX.Element | null => {
  if (!value) return null;
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-6 py-2.5 border-b",
        dark ? "border-paper/12" : "border-ink/10"
      )}
    >
      <dt
        className={cn(
          "shrink-0 font-mono text-[9px] uppercase tracking-[0.22em]",
          dark ? "text-paper/40" : "text-ink/45"
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "text-right text-[12px] leading-snug min-w-0 break-words",
          mono && "font-mono text-[11px] tracking-wide",
          dark ? "text-paper/85" : "text-ink/85"
        )}
      >
        {value}
      </dd>
    </div>
  );
};

/** Wraps a stack of MetaRows in a semantic list. */
export const MetaList = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element => <dl className={className}>{children}</dl>;
