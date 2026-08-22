/**
 * Single source of truth for heritage category colours and display order.
 * Consumed by the map markers, polygons, legend, layer control and side panel
 * so symbology can never drift between components.
 */

export const BRAND_RED = "#E4002B";
export const BRAND_RED_DARK = "#FF6B6B";

export const CATEGORY_COLORS: Record<string, string> = {
  Museum: "#E4002B",
  Fort: "#D35400",
  Castle: "#C0392B",
  Monument: "#8E44AD",
  Shrine: "#27AE60",
  Palace: "#F39C12",
  "Traditional Palace": "#E67E22",
  Artifact: "#2980B9",
  "Jewelry / Beadwork": "#1ABC9C",
  "Archaeological Site": "#7F8C8D",
  "Sacred Grove": "#2ECC71",
  "Historic Building": "#9B59B6",
  Festival: "#E74C3C",
  Textile: "#3498DB",
  "Textile (Kente, etc.)": "#2980B9",
  "Photograph / Digital Media": "#16A085",
  "Audio / Music": "#D4AC0D",
};

export const CATEGORY_COLORS_DARK: Record<string, string> = {
  Museum: "#FF6B6B",
  Fort: "#FFA071",
  Castle: "#FF7675",
  Monument: "#A29BFE",
  Shrine: "#55EFC4",
  Palace: "#FFEAA7",
  "Traditional Palace": "#FDCB6E",
  Artifact: "#74B9FF",
  "Jewelry / Beadwork": "#00CEC9",
  "Archaeological Site": "#B2BEC3",
  "Sacred Grove": "#00B894",
  "Historic Building": "#A29BFE",
  Festival: "#FF7675",
  Textile: "#81ECEC",
  "Textile (Kente, etc.)": "#74B9FF",
  "Photograph / Digital Media": "#55EFC4",
  "Audio / Music": "#FFEAA7",
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
