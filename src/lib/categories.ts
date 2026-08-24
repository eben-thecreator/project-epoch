/**
 * Single source of truth for heritage category colours and display order.
 * Consumed by the map markers, polygons, legend, layer control and side panel
 * so symbology can never drift between components.
 *
 * The palette is the vivid register: markers are full-bleed wax-print swatches,
 * so every hue is pushed to full chroma while keeping its original identity.
 * Museum keeps the brand signal red. Archaeological Site stays earth-toned on
 * purpose — stone cannot carry neon without lying about the material.
 *
 * Dark-mode variants are brighter and more saturated — they render as full
 * marker bodies on near-black basemaps and need to hold against #131110.
 */

export const BRAND_RED = "#E4002B";
export const BRAND_RED_DARK = "#FF7061";

export const CATEGORY_COLORS: Record<string, string> = {
  Museum: "#E4002B",
  Fort: "#E06A1F",
  Castle: "#D94A3D",
  Monument: "#9B59D0",
  Shrine: "#1FA463",
  Palace: "#E2A32E",
  "Traditional Palace": "#C9881E",
  Artifact: "#3B82D6",
  "Jewelry / Beadwork": "#12A38A",
  "Archaeological Site": "#A3813F",
  "Sacred Grove": "#4E9F3D",
  "Historic Building": "#C25399",
  Festival: "#F2664B",
  Textile: "#5C6FD1",
  "Textile (Kente, etc.)": "#F2B01F",
  "Photograph / Digital Media": "#17A2A2",
  "Audio / Music": "#B5AC1E",
};

export const CATEGORY_COLORS_DARK: Record<string, string> = {
  Museum: "#FF5C5C",
  Fort: "#F09060",
  Castle: "#E87060",
  Monument: "#C090E0",
  Shrine: "#60D080",
  Palace: "#F0C860",
  "Traditional Palace": "#E0A050",
  Artifact: "#80B8E8",
  "Jewelry / Beadwork": "#60C8B8",
  "Archaeological Site": "#C0B8A8",
  "Sacred Grove": "#70C880",
  "Historic Building": "#D090C8",
  Festival: "#F08080",
  Textile: "#88A8E8",
  "Textile (Kente, etc.)": "#F0C050",
  "Photograph / Digital Media": "#70C8B8",
  "Audio / Music": "#D8D070",
};

/** Stable display order for legends and filter lists. */
export const CATEGORY_ORDER = Object.keys(CATEGORY_COLORS);

/** Resolve the colour for a category, falling back to brand red. */
export const categoryColor = (
  category: string | null | undefined,
  darkMode = false
): string => {
  if (!category) return darkMode ? BRAND_RED_DARK : BRAND_RED;
  return (darkMode ? CATEGORY_COLORS_DARK : CATEGORY_COLORS)[category] ??
    (darkMode ? BRAND_RED_DARK : BRAND_RED);
};
