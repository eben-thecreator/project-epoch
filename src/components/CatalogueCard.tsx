import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export type CatalogueCardTag = {
  label: string;
  to?: string;
};

interface CatalogueCardProps {
  /** Destination route — omit for records without a detail screen */
  to?: string;
  title: string;
  /** One-line standfirst under the title, gray */
  tagline?: string;
  imageUrl?: string;
  alt?: string;
  /** Scope chips revealed on pointer hover, below the fold */
  tags?: CatalogueCardTag[];
  /** Wide card spanning two thirds of the group grid */
  wide?: boolean;
}

/**
 * Work-card anatomy lifted verbatim from pentagram.com/work (`projectCard`):
 * a 3:2 picture over an ink title + gray standfirst, with scope chips that
 * sit below the fold and slide up on pointer hover (400ms, house ease).
 * The parent clips the translated chip strip, so every card reserves the
 * same whitespace at rest — the reference site's exact behaviour.
 */
export const CatalogueCard = ({
  to,
  title,
  tagline,
  imageUrl,
  alt = "",
  tags = [],
  wide = false,
}: CatalogueCardProps): JSX.Element => {
  const [isLoaded, setIsLoaded] = useState(false);

  const pictureWell = (
    <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden bg-hairline">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        <span className="f-caption text-ink-soft">No media</span>
      )}
    </div>
  );

  return (
    <div className={cn("group relative overflow-hidden", wide && "md:col-span-2")}>
      {/* Picture well — hairline skeleton until the image fades through */}
      {to ? (
        <Link to={to} aria-label={`View ${title}`} className="relative z-[5] block">
          {pictureWell}
        </Link>
      ) : (
        <div className="relative z-[5] block">{pictureWell}</div>
      )}

      {/* Title + standfirst */}
      {to ? (
        <Link
          to={to}
          className="relative z-[1] block bg-white pt-2 md:pr-3 lg:pr-6"
        >
          <h3 className="f-body-1 text-ink">{title}</h3>
          {tagline ? (
            <p className="f-body-1 text-ink-soft line-clamp-2">{tagline}</p>
          ) : null}
        </Link>
      ) : (
        <div className="relative z-[1] block bg-white pt-2 md:pr-3 lg:pr-6">
          <h3 className="f-body-1 text-ink">{title}</h3>
          {tagline ? (
            <p className="f-body-1 text-ink-soft line-clamp-2">{tagline}</p>
          ) : null}
        </div>
      )}

      {/* Scope chips — parked below the fold, cascading up one by one on hover */}
      {tags.length > 0 && (
        <div aria-hidden="true">
          <div className="hidden flex-row flex-wrap gap-2 pt-2 [@media(hover:hover)_and_(pointer:fine)]:flex">
            {tags.map((tag, i) => {
              const motion =
                "translate-y-[10px] opacity-0 transition-all duration-300 ease-house [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:[transition-delay:var(--chip-delay,0ms)]";
              const style = {
                "--chip-delay": `${i * 60}ms`,
              } as CSSProperties;
              return tag.to ? (
                <Link
                  key={tag.label}
                  to={tag.to}
                  tabIndex={-1}
                  onClick={(e) => e.stopPropagation()}
                  style={style}
                  className={cn(
                    "f-caption rounded bg-paper-deep px-2 py-1 leading-none text-ink-soft hover:bg-hairline hover:text-ink",
                    motion
                  )}
                >
                  {tag.label}
                </Link>
              ) : (
                <span
                  key={tag.label}
                  style={style}
                  className={cn(
                    "f-caption rounded bg-paper-deep px-2 py-1 leading-none text-ink-soft",
                    motion
                  )}
                >
                  {tag.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/** Group shape mirroring the reference rhythm: a ⅓+⅔ featured pair, then trios */
export type CatalogueGroup<T> =
  | { kind: "pair"; items: T[] }
  | { kind: "trio"; items: T[] };

/**
 * Chunk records into the alternating rhythm of the reference work index:
 * one featured pair (narrow + wide), then a trio of equal cards, repeat.
 */
export function buildCatalogueGroups<T>(items: T[]): CatalogueGroup<T>[] {
  const groups: CatalogueGroup<T>[] = [];
  let i = 0;
  let pairNext = true;
  while (i < items.length) {
    const size = pairNext ? 2 : 3;
    const slice = items.slice(i, i + size);
    groups.push(
      pairNext ? { kind: "pair", items: slice } : { kind: "trio", items: slice }
    );
    i += size;
    pairNext = !pairNext;
  }
  return groups;
}
