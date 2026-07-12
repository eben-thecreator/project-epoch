import React from "react";
import { divIcon } from "leaflet";
import { Marker, useMap } from "react-leaflet";

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
  Fort: { color: "#E4002B", shape: "castle" },
  Castle: { color: "#E4002B", shape: "castle" },
  Monument: { color: "#E4002B", shape: "monument" },
  Shrine: { color: "#E4002B", shape: "shrine" },
  Palace: { color: "#E4002B", shape: "palace" },
  "Traditional Palace": { color: "#E4002B", shape: "palace" },
  Artifact: { color: "#E4002B", shape: "artifact" },
  "Jewelry / Beadwork": { color: "#E4002B", shape: "jewelry" },
  "Archaeological Site": { color: "#E4002B", shape: "site" },
  "Sacred Grove": { color: "#E4002B", shape: "grove" },
  "Historic Building": { color: "#E4002B", shape: "building" },
  Festival: { color: "#E4002B", shape: "festival" },
  Textile: { color: "#E4002B", shape: "textile" },
  "Textile (Kente, etc.)": { color: "#E4002B", shape: "textile" },
  "Photograph / Digital Media": { color: "#E4002B", shape: "media" },
  "Audio / Music": { color: "#E4002B", shape: "audio" },
};

const darkCategoryStyles: Record<string, { color: string; shape: string }> = {
  ...categoryStyles
};

const defaultStyle = { color: "#E4002B", shape: "circle" };
const darkDefaultStyle = { color: "#E4002B", shape: "circle" };

function buildSvg(shape: string, color: string, size: number, label: string, showLabel: boolean, labelColor: string): string {
  const s = size;
  const half = s / 2;
  const strokeColor = "#ffffff";
  const inner = `fill="${color}" stroke="${strokeColor}" stroke-width="1.5"`;

  const pathD = paths[shape] || paths.circle;
  const shapeSvg = `<g transform="scale(${s / 24})">
    <path d="${pathD}" ${inner} opacity="0.9"/>
  </g>`;

  const labelSvg = showLabel && label
    ? `<text x="${half}" y="${s + 10}" text-anchor="middle" fill="${labelColor}" font-size="8" font-weight="700" font-family="Helvetica, Arial, sans-serif" letter-spacing="0.08em" opacity="0.7">${escapeXml(label.substring(0, 22))}</text>`
    : "";

  const totalHeight = showLabel && label ? s + 18 : s;

  return `<svg width="${s}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    ${shapeSvg}
    ${labelSvg}
  </svg>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function getStyle(category: string | null | undefined, dark: boolean) {
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
  const labelColor = dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
  const svg = buildSvg(shape, color, size, name || "", showLabel, labelColor);
  const totalHeight = showLabel && name ? size + 18 : size;
  return divIcon({
    html: svg,
    className: "",
    iconSize: [size, totalHeight],
    iconAnchor: [size / 2, size / 2],
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
  ({ position, category, name = "", showLabel = false, darkMode = false, onClick }) => {
    const icon = React.useMemo(
      () => createMarkerIcon(category, name, showLabel, darkMode),
      [category, name, showLabel, darkMode]
    );
    return <Marker position={position} icon={icon} eventHandlers={{ click: onClick }} />;
  }
);

AssetMarker.displayName = "AssetMarker";
