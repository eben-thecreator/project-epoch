import { geometryCenter } from "../../../lib/geometry";

export interface ExportableAsset {
  id: string | number;
  name?: string;
  alternative_name?: string | null;
  asset_category?: string | null;
  asset_type?: string | null;
  period?: string | null;
  period_start?: number | null;
  period_end?: number | null;
  region?: string | null;
  district?: string | null;
  community?: string | null;
  cultural_group?: string | null;
  material?: string | null;
  technique?: string | null;
  condition?: string | null;
  ownership?: string | null;
  conservation_status?: string | null;
  data_source?: string | null;
  geometry?: {
    type: string;
    coordinates: unknown;
  } | null;
}

const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  a: [number, number],
  b: [number, number]
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(s));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

export function assetPoint(
  asset: ExportableAsset
): [number, number] | null {
  const c = geometryCenter(asset.geometry as never);
  return c ?? null;
}

const PUBLIC_FIELDS = [
  "id",
  "name",
  "alternative_name",
  "asset_category",
  "asset_type",
  "period",
  "period_start",
  "period_end",
  "region",
  "district",
  "community",
  "cultural_group",
  "material",
  "technique",
  "condition",
  "ownership",
  "conservation_status",
  "data_source",
] as const;

function publicRow(asset: ExportableAsset): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const source = asset as unknown as Record<string, unknown>;
  for (const key of PUBLIC_FIELDS) {
    row[key] = source[key] ?? "";
  }
  const pt = assetPoint(asset);
  row.latitude = pt ? Number(pt[0].toFixed(5)) : "";
  row.longitude = pt ? Number(pt[1].toFixed(5)) : "";
  return row;
}

function download(content: string, mime: string, stem: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = stem;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function fileStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCSV(assets: ExportableAsset[]): void {
  const rows = assets.map(publicRow);
  const header = Object.keys(rows[0] ?? { id: "" });
  const lines = [
    header.join(","),
    ...rows.map((r) => header.map((h) => csvCell(r[h])).join(",")),
  ];
  download(lines.join("\r\n"), "text/csv", `schis-atlas-${fileStamp()}.csv`);
}

export function exportGeoJSON(assets: ExportableAsset[]): void {
  const fc = {
    type: "FeatureCollection",
    features: assets.map((a) => ({
      type: "Feature",
      geometry: (a.geometry as GeoJSON.Geometry | null) ?? {
        type: "Point",
        coordinates: [],
      },
      properties: publicRow(a),
    })),
  };
  download(
    JSON.stringify(fc, null, 2),
    "application/geo+json",
    `schis-atlas-${fileStamp()}.geojson`
  );
}

function kmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportKML(assets: ExportableAsset[]): void {
  const placemarks = assets
    .map((a) => {
      const pt = assetPoint(a);
      if (!pt) return "";
      const desc = [
        a.asset_category,
        a.period,
        [a.district, a.region].filter(Boolean).join(", "),
      ]
        .filter(Boolean)
        .join(" \u00b7 ");
      return `    <Placemark>
      <name>${kmlEscape(a.name || "Untitled record")}</name>
      <description><![CDATA[${desc}]]></description>
      <Point><coordinates>${pt[1]},${pt[0]},0</coordinates></Point>
    </Placemark>`;
    })
    .filter(Boolean)
    .join("\n");
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Project Work Heritage Atlas</name>
${placemarks}
  </Document>
</kml>`;
  download(kml, "application/vnd.google-earth.kml+xml", `schis-atlas-${fileStamp()}.kml`);
}
