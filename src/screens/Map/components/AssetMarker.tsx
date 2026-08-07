import React from "react";
import { divIcon } from "leaflet";
import { Marker } from "react-leaflet";

const paths: Record<string, string> = {
  museum: "M4 10v10h2V10H4zm6 0v10h2V10h-2zm6 0v10h2V10h-2zM2 22h20v-2H2v2zm11-18L3 8h18L13 4z",
  castle: "M21 7v13H3V7h3v2h2V7h2v2h2V7h2v2h2V7h5zM9 14H7v3h2v-3zm6 0h-2v3h2v-3z",
  monument: "M9 22h6v-2H9v2zm1-2h4V6l-2-4-2 4v14z",
  shrine: "M4 22h2v-8c0-3.31 2.69-6 6-6s6 2.69 6 6v8h2v-8c0-4.42-3.58-8-8-8s-8 3.58-8 8v8z",
  palace: "M3 22h18v-4H3v4zm2-6h2V6L5 8v8zm5 0h4V4l-2-2-2 2v12zm5 0h2V8l-2-2v10z",
  artifact: "M16 4h-8L6 9v2c0 2 1.5 3.5 3 4v5h6v-5c1.5-.5 3-2 3-4V9l-2-5z",
  jewelry: "M12 2L2 9l10 13 10-13L12 2zm0 3.5l4 4.5H8l4-4.5z",
  site: "M15.5 2.5l6 6-4 4-2-2-6 6v4h-4v-4l6-6-2-2 4-4z",
  grove: "M12 2C7 2 4 6 4 10c0 3 2 5.5 4.5 6.5V22h7v-5.5C18 15.5 20 13 20 10c0-4-3-8-8-8z",
  building: "M12 3L2 12h3v8h14v-8h3L12 3zm-2 15H7v-5h3v5zm7 0h-3v-5h3v5z",
  festival: "M7 4h10v16H7V4zm2 2v2h6V6H9zm0 10v2h6v-2H9z",
  textile: "M4 4h2v16H4V4zm4 0h2v16H8V4zm4 0h2v16h-2V4zm4 0h2v16h-2V4z M2 6h20v2H2V6zm0 4h20v2H2v-2zm0 4h20v2H2v-2zm0 4h20v2H2v-2z",
  media: "M20 6h-4l-2-2H10L8 6H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 10c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  audio: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
  circle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
};

const categoryStyles: Record<string, { color: string; shape: string }> = {
  Museum: { color: "#E4002B", shape: "museum" },
  Fort: { color: "#D35400", shape: "castle" },
  Castle: { color: "#C0392B", shape: "castle" },
  Monument: { color: "#8E44AD", shape: "monument" },
  Shrine: { color: "#27AE60", shape: "shrine" },
  Palace: { color: "#F39C12", shape: "palace" },
  "Traditional Palace": { color: "#E67E22", shape: "palace" },
  Artifact: { color: "#2980B9", shape: "artifact" },
  "Jewelry / Beadwork": { color: "#1ABC9C", shape: "jewelry" },
  "Archaeological Site": { color: "#7F8C8D", shape: "site" },
  "Sacred Grove": { color: "#2ECC71", shape: "grove" },
  "Historic Building": { color: "#9B59B6", shape: "building" },
  Festival: { color: "#E74C3C", shape: "festival" },
  Textile: { color: "#3498DB", shape: "textile" },
  "Textile (Kente, etc.)": { color: "#2980B9", shape: "textile" },
  "Photograph / Digital Media": { color: "#16A085", shape: "media" },
  "Audio / Music": { color: "#D4AC0D", shape: "audio" },
};

const darkCategoryStyles: Record<string, { color: string; shape: string }> = {
  Museum: { color: "#FF6B6B", shape: "museum" },
  Fort: { color: "#FFA071", shape: "castle" },
  Castle: { color: "#FF7675", shape: "castle" },
  Monument: { color: "#A29BFE", shape: "monument" },
  Shrine: { color: "#55EFC4", shape: "shrine" },
  Palace: { color: "#FFEAA7", shape: "palace" },
  "Traditional Palace": { color: "#FDCB6E", shape: "palace" },
  Artifact: { color: "#74B9FF", shape: "artifact" },
  "Jewelry / Beadwork": { color: "#00CEC9", shape: "jewelry" },
  "Archaeological Site": { color: "#B2BEC3", shape: "site" },
  "Sacred Grove": { color: "#00B894", shape: "grove" },
  "Historic Building": { color: "#A29BFE", shape: "building" },
  Festival: { color: "#FF7675", shape: "festival" },
  Textile: { color: "#81ECEC", shape: "textile" },
  "Textile (Kente, etc.)": { color: "#74B9FF", shape: "textile" },
  "Photograph / Digital Media": { color: "#55EFC4", shape: "media" },
  "Audio / Music": { color: "#FFEAA7", shape: "audio" },
};

const defaultStyle = { color: "#E4002B", shape: "circle" };
const darkDefaultStyle = { color: "#FF6B6B", shape: "circle" };

function buildSvg(
  shape: string,
  color: string,
  size: number,
  label: string,
  showLabel: boolean,
  labelColor: string
): string {
  const s = size;
  const half = s / 2;

  const pathD = paths[shape] || paths.circle;
  const shapeSvg = `<g transform="scale(${s / 24})">
    <path d="${pathD}" fill="${color}" stroke="none" opacity="1"/>
  </g>`;

  let labelSvg = "";
  let labelBlockHeight = 0;
  const maxLabelWidth = 120;

  if (showLabel && label) {
    const displayLabel =
      label.length > 30 ? label.substring(0, 28) + "\u2026" : label;
    const escaped = escapeXml(displayLabel);
    const pillW = Math.min(maxLabelWidth, escaped.length * 5.5 + 12);
    const pillH = 14;
    const pillX = half - pillW / 2;
    const pillY = s + 3;
    labelBlockHeight = pillH + 4;
    labelSvg = `
      <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="3" ry="3" fill="rgba(255,255,255,0.82)" stroke="none"/>
      <text x="${half}" y="${pillY + 10}" text-anchor="middle" fill="${labelColor}" font-size="9" font-weight="700" font-family="Helvetica,Arial,sans-serif" letter-spacing="0.04em">${escaped}</text>`;
  }

  const totalWidth = Math.max(s, 120);
  const totalHeight = s + labelBlockHeight;
  const xOffset = (totalWidth - s) / 2;

  return `<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${xOffset},0)">
      ${shapeSvg}
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

function getStyle(
  category: string | null | undefined,
  dark: boolean
) {
  const styles = dark ? darkCategoryStyles : categoryStyles;
  if (!category) return dark ? darkDefaultStyle : defaultStyle;
  return styles[category] || (dark ? darkDefaultStyle : defaultStyle);
}

export function createMarkerIcon(
  category: string | null | undefined,
  name: string,
  showLabel: boolean,
  dark: boolean,
  size = 24
) {
  const { color, shape } = getStyle(category, dark);
  const labelColor = "rgba(20,20,20,0.9)";
  const svg = buildSvg(shape, color, size, name || "", showLabel, labelColor);
  const totalWidth = Math.max(size, 120);
  const labelBlockHeight = showLabel && name ? 18 : 0;
  const totalHeight = size + labelBlockHeight;
  return divIcon({
    html: svg,
    className: "",
    iconSize: [totalWidth, totalHeight],
    iconAnchor: [totalWidth / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

interface AssetMarkerProps {
  position: [number, number];
  category: string | null | undefined;
  name?: string;
  showLabel?: boolean;
  darkMode?: boolean;
  onClick?: () => void;
}

export const AssetMarker: React.FC<AssetMarkerProps> = React.memo(
  ({
    position,
    category,
    name = "",
    showLabel = false,
    darkMode = false,
    onClick,
  }) => {
    const icon = React.useMemo(
      () => createMarkerIcon(category, name, showLabel, darkMode),
      [category, name, showLabel, darkMode]
    );
    return (
      <Marker
        position={position}
        icon={icon}
        eventHandlers={{ click: onClick }}
      >
        {name && (
          <title>{`${name}${category ? ` (${category})` : ""}`}</title>
        )}
      </Marker>
    );
  }
);

AssetMarker.displayName = "AssetMarker";
