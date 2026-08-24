import { divIcon, type DivIcon } from "leaflet";
import { categoryColor } from "../../../lib/categories";

/**
 * Symbology source of truth: category glyphs, marker icon builder and
 * cluster donut builder. The legend renders from these tables so the map
 * and its key can never drift apart.
 *
 * Wax-print swatch system:
 *  - Every asset is a cloth sample cut with pinking shears: a full-bleed
 *    vivid category mat with an ink window set into it. The glyph sits
 *    white-on-ink — the one pairing that always reads at 26 px; white on
 *    mid-tone colour melted into a blob in testing. A folded corner and an
 *    ink keyline finish the cloth; the keyline also holds the swatch to any
 *    basemap.
 *  - UNESCO World Heritage sites gain a brass key-line and step up one
 *    size — the collection's headline objects read at national scale.
 *  - The selected asset wears a brand-red survey reticle ring; everything
 *    else dims via CSS (`.dim-others` on the map root).
 *  - The legend never restates the marker: it binds colour → word with a
 *    flat swatch chip, the standard cartographic key.
 */

/* ────────────────────────── glyphs ────────────────────────── */

/** Circle subpath helper — beads, medallions, oculus holes. */
const circ = (cx: number, cy: number, r: number): string =>
  `M${cx} ${cy - r}a${r} ${r} 0 1 0 0 ${2 * r}a${r} ${r} 0 1 0 0 ${-2 * r}Z`;

/**
 * Bespoke 24-unit glyphs, one per category, fill-rule evenodd.
 * Ghana-specific where the category allows: Black Star arch, shrine house,
 * Asante pavilion, Akan pot, kente strip, talking drum, acacia, TLR camera,
 * archive disc, excavation grid.
 */
export const CATEGORY_GLYPHS: Record<string, string> = {
  museum:
    "M12 1L22 8H2Z" + circ(12, 5.55, 1.85) +
    "M3 10V8h18v2Z" +
    "M5.3 18.5v-8h2.4v8ZM10.8 18.5v-8h2.4v8ZM16.3 18.5v-8h2.4v8Z" +
    "M3 21v-1.4h18V21ZM4.8 19.6v-1.1h14.4v1.1Z",
  fort:
    "M2 21V7.5h2.2V10h1.5v1.3h1.3V10h1.5V2.75h1.8V5h.75V2.75h1.9V5h.75V2.75h1.8V10h1.5v1.3h1.3V10h1.5V7.5H22V21Z" +
    "M9.9 21v-5.2a2.1 2.1 0 0 1 4.2 0V21Z" +
    "M9.7 9V7h1.5v2ZM12.8 9V7h1.5v2Z",
  castle:
    "M2.4 6.4L6.5 1.8l4.1 4.6h-1V11h1.4V9.6h1.5V11h3V9.6h1.5V11h4v10H3.4V6.4Z" +
    "M5.7 11V9h1.8v2ZM5.7 15v-2h1.8v2ZM5 21v-3.4a1.5 1.5 0 0 1 3 0V21Z" +
    "M13.2 16v-2h1.6v2ZM17.4 16v-2h1.6v2Z",
  monument:
    "M12 2.5l.92 1.99 1.93.08-1.66 1.32.57 2.04L12 6.75l-1.76 1.18.57-2.04L9.15 4.57l1.93-.08Z" +
    "M3 10.5v-2h18v2ZM5.5 19.5v-9h13v9ZM4 21v-1.5h16V21Z" +
    "M8.5 21v-7.5a3.5 3.5 0 0 1 7 0V21Z",
  shrine:
    "M12 2.6C9.8 6.4 7 9.2 3.6 11h16.8C17 9.2 14.2 6.4 12 2.6Z" + circ(12, 1.5, 1.05) +
    "M5.2 21V11h13.6v10ZM4.4 21v-1.8h15.2V21Z" +
    "M7 15v-1.5h1.2V15ZM15.8 15v-1.5H17V15Z" +
    "M9.8 21v-4.4a2.2 2.2 0 0 1 4.4 0V21Z",
  palace:
    "M3 21v-9l6-3V4.5Q9 2.6 12 2.6t3 1.9V9l6 3v9Z" +
    "M12 .5l1.35 2-1.35 2-1.35-2Z" + circ(12, 8.2, 1.2) +
    "M10.3 21v-3.6a1.7 1.7 0 0 1 3.4 0V21Z" +
    "M4.8 16.2v-2.4h1.8v2.4ZM17.4 16.2v-2.4h1.8v2.4Z",
  artifact:
    "M8 3h8v1.6h-2.2c3.6 1.8 5.2 4.1 5.2 6.8 0 3.8-2.4 6.7-4.2 7.8H9.2C7.4 18.1 5 15.2 5 11.4c0-2.7 1.6-5 5.2-6.8H8Z" +
    circ(12, 11.5, 2),
  jewelry:
    circ(5, 5.5, 1.45) + circ(7.1, 8.7, 1.45) + circ(9.5, 10.9, 1.45) +
    circ(12, 11.7, 1.45) + circ(14.5, 10.9, 1.45) + circ(16.9, 8.7, 1.45) +
    circ(19, 5.5, 1.45) + circ(12, 16.6, 2.7) + circ(12, 16.6, 0.85),
  site:
    "M3 21V5h18v16ZM6 18V8h12v10Z" +
    "M11.2 18V8h1.6v10ZM6 13.4v-1.6h12v1.6Z" +
    circ(8.6, 9.9, 0.95) + circ(15.4, 15.7, 0.95) +
    "M5.4 5V2.2h.9V5ZM6.3 2.2l3.4 1.1-3.4 1.1Z",
  grove:
    "M2.6 8.4Q12 4.8 21.4 8.4Q12 10.6 2.6 8.4Z" +
    "M6.2 12.1Q12 9.7 17.8 12.1Q12 13.9 6.2 12.1Z" +
    "M11.1 21v-6.6L8.3 11.5l.7-.7 2.4 2.5h1.2l2.4-2.5.7.7-2.8 2.9V21Z",
  building:
    "M3 9.5l6-5h6l6 5Z" +
    "M4.5 21V9.5h15V21ZM3.5 21v-1.2h17V21Z" +
    "M6.2 14.2V12h1.7v2.2ZM11.15 14.2V12h1.7v2.2ZM16.1 14.2V12h1.7v2.2Z" +
    "M10.4 21v-4.6a1.6 1.6 0 0 1 3.2 0V21Z" +
    "M6.2 19.4v-2.2h1.7v2.2ZM16.1 19.4v-2.2h1.7v2.2Z",
  festival:
    "M6.5 3h9v2.6c-2.4 1.5-3.3 3.1-3.3 6.4s.9 4.9 3.3 6.4V21h-9v-2.6c2.4-1.5 3.3-3.1 3.3-6.4S8.9 7.1 6.5 5.6Z" +
    "M14.4 8.4l7-5.8.64.78-7 5.8ZM9.9 15.9l-7 5.8-.64-.78 7-5.8Z",
  textile:
    "M7 17V3h10v14Z" +
    "M7 5h3.3L8.65 7.8ZM10.35 5h3.3L12 7.8ZM13.7 5h3.3l-1.65 2.8Z" +
    "M8.6 12.4v-3h2.4v3ZM13 12.4v-3h2.4v3Z" +
    "M7 13.6h2.2l1.4 1.6 1.4-1.6 1.4 1.6 1.4-1.6H17v2.6H7Z" +
    "M7.6 21.4V18h1.1v3.4ZM10.2 21.4V18h1.1v3.4ZM12.8 21.4V18h1.1v3.4ZM15.4 21.4V18h1.1v3.4Z",
  media:
    "M2.2 10.6h1.8v4.2H2.2Z" +
    "M4 21V8h16v13ZM6 8V4.5h12V8ZM9 4.5V3.2h6v1.3Z" + circ(12, 6.25, 1.2) +
    circ(12, 14.5, 4.3) + circ(12, 14.5, 3.05) + circ(12, 14.5, 1.5),
  audio:
    circ(11, 13, 8.2) + circ(11, 13, 6.3) + circ(11, 13, 5.8) + circ(11, 13, 4.6) +
    circ(11, 13, 4.1) + circ(11, 13, 2.6) + circ(11, 13, 2.2) + circ(11, 13, 0.9) +
    circ(20, 4.2, 1.5) +
    "M19.99 5.59 19.21 4.81 14.99 9.81l.78.78Z" + circ(14.4, 11.2, 0.85),
  fallback:
    "M12 2l2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3Z" + circ(12, 12, 1.2),
};

const SHAPES: Record<string, string> = {
  Museum: "museum",
  Fort: "fort",
  Castle: "castle",
  Monument: "monument",
  Shrine: "shrine",
  Palace: "palace",
  "Traditional Palace": "palace",
  Artifact: "artifact",
  "Jewelry / Beadwork": "jewelry",
  "Archaeological Site": "site",
  "Sacred Grove": "grove",
  "Historic Building": "building",
  Festival: "festival",
  Textile: "textile",
  "Textile (Kente, etc.)": "textile",
  "Photograph / Digital Media": "media",
  "Audio / Music": "audio",
};

/** Glyph path for a category, falling back to the compass point. */
export function glyphForCategory(
  category: string | null | undefined
): string {
  const shape = (category && SHAPES[category]) || "fallback";
  return CATEGORY_GLYPHS[shape] || CATEGORY_GLYPHS.fallback;
}

/* ──────────────────────── swatch body ─────────────────────── */

/** Pinking-shear edge: zigzag teeth along one straight side. */
function sawtoothSide(
  ax: number, ay: number, bx: number, by: number,
  nx: number, ny: number, n: number, depth: number
): string[] {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const tm = (i + 0.5) / n;
    pts.push(`${(ax + (bx - ax) * t0).toFixed(2)} ${(ay + (by - ay) * t0).toFixed(2)}`);
    pts.push(`${(ax + (bx - ax) * tm + nx * depth).toFixed(2)} ${(ay + (by - ay) * tm + ny * depth).toFixed(2)}`);
  }
  return pts;
}

/** Wax-print blank: 22-unit square (2..24) with pinked edges, in 26-space. */
const SWATCH_BODY =
  "M" + [
    ...sawtoothSide(2, 2, 24, 2, 0, -1, 7, 1.35),
    ...sawtoothSide(24, 2, 24, 24, 1, 0, 7, 1.35),
    ...sawtoothSide(24, 24, 2, 24, 0, 1, 7, 1.35),
    ...sawtoothSide(2, 24, 2, 2, -1, 0, 7, 1.35),
  ].join("L") + "Z";

/** Marker fill: near-black keyline, warm enough to sit on parchment. */
const INK = "#1A1A1A";
const INK_DARK = "#1E1C1B";

/** Glyph fill: warm off-white on light, pure white on satellite. */
const GLYPH_LIGHT = "#FAFAF8";
const GLYPH_DARK = "#FFFFFF";

/** Brass emphasis tones for UNESCO World Heritage key-lines. */
const UNESCO_RING_LIGHT = "#C2913B";
const UNESCO_RING_DARK = "#E5BE74";

/** Cream crease + weft accents shared with the legend chips. */
const CREAM = "#F6EFDC";

export interface MarkerIconOptions {
  /** Swatch diameter in px (default 26). */
  size?: number;
  /** Draw the rotating survey reticle around the marker. */
  selected?: boolean;
  /** Emphasise as UNESCO World Heritage (brass key-line + size bump). */
  unesco?: boolean;
}

/** True when an asset carries a World Heritage designation. */
export function isWorldHeritage(
  conservationStatus?: string | null
): boolean {
  return !!conservationStatus && /world heritage/i.test(conservationStatus);
}

function buildSvg(
  shape: string,
  color: string,
  size: number,
  label: string,
  showLabel: boolean,
  dark: boolean,
  selected: boolean,
  unesco: boolean
): string {
  // UNESCO sites step up one size tier so national scale reads instantly
  const s = unesco && !selected ? size + 4 : size;
  const k = s / 26;
  const pathD = CATEGORY_GLYPHS[shape] || CATEGORY_GLYPHS.fallback;
  const ink = dark ? INK_DARK : INK;
  const glyphFill = dark ? GLYPH_DARK : GLYPH_LIGHT;
  const brass = dark ? UNESCO_RING_DARK : UNESCO_RING_LIGHT;

  const body = `
    <g transform="scale(${k})">
      ${
        unesco
          ? `<rect x=".4" y=".4" width="25.2" height="25.2" fill="none" stroke="${brass}" stroke-width="1.8"/>`
          : ""
      }
      <path d="${SWATCH_BODY}" fill="${color}"/>
      <rect x="4" y="4" width="18" height="18" fill="${ink}"/>
      <g transform="translate(6.5,6.5) scale(0.5417)">
        <path d="${pathD}" fill="${glyphFill}" fill-rule="evenodd"/>
      </g>
      <path d="M18.6 2L24 2 24 7.4Z" fill="#000" opacity=".38"/>
      <path d="M18.6 2L24 7.4" stroke="${CREAM}" stroke-width=".9" opacity=".85" fill="none"/>
      <path d="${SWATCH_BODY}" fill="none" stroke="${dark ? "rgba(255,255,255,.3)" : ink}" stroke-width="1.05"/>
    </g>
  `;

  return wrapSvg(body, s, label, showLabel, dark, selected);
}

function wrapSvg(
  body: string,
  s: number,
  label: string,
  showLabel: boolean,
  dark: boolean,
  selected: boolean
): string {
  const half = s / 2;
  let labelSvg = "";
  let labelBlockHeight = 0;

  if (showLabel && label) {
    const displayLabel =
      label.length > 30 ? label.substring(0, 28) + "\u2026" : label;
    const escaped = escapeXml(displayLabel);
    const pillW = Math.min(120, escaped.length * 5.5 + 12);
    const pillH = 15;
    const pillX = half - pillW / 2;
    const pillY = s + 3;
    labelBlockHeight = pillH + 4;
    const pillBg = dark ? "rgba(19,17,16,0.92)" : "rgba(242,239,231,0.94)";
    const pillBorder = dark ? "rgba(255,255,255,0.15)" : "rgba(25,22,19,0.18)";
    const textFill = dark ? "#F2EFE7" : "#191613";

    labelSvg = `
      <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="0" ry="0" fill="${pillBg}" stroke="${pillBorder}" stroke-width="0.75"/>
      <text x="${half}" y="${pillY + 11}" text-anchor="middle" fill="${textFill}" font-size="9" font-weight="600" font-family="'IBM Plex Mono', ui-monospace, monospace" letter-spacing="0.04em">${escaped}</text>`;
  }

  // Selection reticle: four survey brackets on a slow orbit
  let reticleSvg = "";
  if (selected) {
    const r = half + 6;
    const brand = dark ? "#FF7061" : "#E4002B";
    reticleSvg = `
      <circle class="reticle-ring" cx="${half}" cy="${half}" r="${r}" fill="none" stroke="${brand}" stroke-width="1.5" stroke-dasharray="6 5" />
      <circle cx="${half}" cy="${half}" r="${r + 3.5}" fill="none" stroke="${brand}" stroke-width="0.75" opacity="0.45" />
    `;
  }

  const totalWidth = Math.max(s, half * 2 + 26);
  const totalHeight = s + labelBlockHeight;
  const xOffset = (totalWidth - s) / 2;

  return `<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${xOffset},0)">
      ${body}
      ${reticleSvg}
    </g>
    ${labelSvg}
  </svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function createMarkerIcon(
  category: string | null | undefined,
  name: string,
  showLabel: boolean,
  dark: boolean,
  opts: number | MarkerIconOptions = {}
): DivIcon {
  const o: MarkerIconOptions = typeof opts === "number" ? { size: opts } : opts;
  const size = o.size ?? 26;
  const color = categoryColor(category, dark);
  const shape = (category && SHAPES[category]) || "fallback";
  const svg = buildSvg(
    shape,
    color,
    size,
    name || "",
    showLabel,
    dark,
    !!o.selected,
    !!o.unesco
  );
  const effSize = o.unesco && !o.selected ? size + 4 : size;
  const totalWidth = Math.max(effSize, effSize + 26);
  const labelBlockHeight = showLabel && name ? 19 : 0;
  const totalHeight = effSize + labelBlockHeight;
  return divIcon({
    html: svg,
    className: `custom-marker${o.selected ? " is-selected" : ""}`,
    iconSize: [totalWidth, totalHeight],
    iconAnchor: [totalWidth / 2, effSize / 2],
    popupAnchor: [0, -effSize / 2],
  });
}

/* ------------------------------ clusters ------------------------------ */

/**
 * Cluster heads are donuts: segments show the category mix of the children
 * beneath them, the count sits in the hub. A cluster that reads as a single
 * colour promises a single-kind neighbourhood; a mixed wheel promises a
 * cross-section. Monochrome fallback when the mix is unreadably diverse.
 */
export function createClusterIcon(
  count: number,
  mix: Array<{ color: string; count: number }>,
  dark: boolean
): DivIcon {
  let size = 32;
  if (count >= 50) size = 48;
  else if (count >= 10) size = 40;

  const half = size / 2;
  const radius = half - 5;
  const circumference = 2 * Math.PI * radius;

  const sorted = [...mix].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, m) => sum + m.count, 0) || 1;

  let segments = "";
  if (sorted.length >= 2 && sorted.length <= 8) {
    let offset = 0;
    for (const seg of sorted) {
      const frac = seg.count / total;
      const dash = frac * circumference;
      segments += `<circle cx="${half}" cy="${half}" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="4.5"
        stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${half} ${half})" />`;
      offset += dash;
    }
  } else {
    const single = categoryColor(null, dark);
    segments = `<circle cx="${half}" cy="${half}" r="${radius}" fill="none" stroke="${single}" stroke-width="4.5" />`;
  }

  const bg = dark ? INK_DARK : INK;
  const border = dark ? "rgba(255,255,255,0.45)" : "#FFFFFF";
  const text = dark ? GLYPH_DARK : GLYPH_LIGHT;

  return divIcon({
    html: `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="${half}" cy="${half}" r="${half - 1}" fill="${bg}" stroke="${border}" stroke-width="1" />
      ${segments}
      <text x="${half}" y="${half + 3.5}" text-anchor="middle" fill="${text}"
        font-size="${count >= 1000 ? 9 : count >= 100 ? 10 : 11.5}" font-weight="600"
        font-family="'IBM Plex Mono', ui-monospace, monospace">${count}</text>
    </svg>`,
    className: "custom-cluster custom-cluster-donut",
    iconSize: [size, size],
  });
}
