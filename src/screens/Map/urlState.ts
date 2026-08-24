import type { Basemap } from "./components/MapView";

/**
 * Permalink codec for the atlas. Every piece of session state a researcher
 * might cite — viewport, basemap, layer stack, attribute filters, temporal
 * span, spatial selection, query text and the open record — round-trips
 * through the query string so any view can be shared or footnoted.
 */

export interface SpatialFilter {
  kind: "radius";
  center: [number, number];
  radiusM: number;
}

export interface AtlasUrlState {
  center?: [number, number];
  zoom?: number;
  basemap?: Basemap;
  filters?: Record<string, string>;
  yearRange?: [number, number];
  selectedId?: string | null;
  layers?: string[];
  hiddenLayers?: string[];
  query?: string | null;
  spatial?: SpatialFilter | null;
}

export const BASEMAPS: Basemap[] = ["grey", "satellite"];

const num = (raw: string | null): number | null => {
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const LAYER_KEYS = [
  "assets",
  "boundaries",
  "zones",
  "density",
  "regions",
  "districts",
  "roads",
  "rivers",
  "protected_areas",
] as const;

function parseCsvList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is (typeof LAYER_KEYS)[number] =>
      (LAYER_KEYS as readonly string[]).includes(s)
    );
}

/** Read atlas-owned keys out of a query string. Tolerant of garbage. */
export function parseAtlasState(search: string): AtlasUrlState {
  const params = new URLSearchParams(search);
  const state: AtlasUrlState = {};

  const lat = num(params.get("lat"));
  const lng = num(params.get("lng"));
  const zoom = num(params.get("z"));
  if (lat !== null && lng !== null) {
    state.center = [
      Math.min(12, Math.max(-2, lat)),
      Math.min(4, Math.max(-6, lng)),
    ];
    if (zoom !== null) state.zoom = Math.min(18, Math.max(5, Math.round(zoom)));
  }

  const bm = params.get("bm");
  if (bm && (BASEMAPS as string[]).includes(bm)) {
    state.basemap = bm as Basemap;
  }

  const y0 = num(params.get("y0"));
  const y1 = num(params.get("y1"));
  if (y0 !== null && y1 !== null && y1 > y0) {
    state.yearRange = [y0, y1];
  }

  const sel = params.get("sel");
  if (sel) state.selectedId = sel;

  const q = params.get("q");
  if (q) state.query = q;

  const layers = parseCsvList(params.get("layers"));
  if (layers.length > 0) {
    state.layers = layers.filter((l) =>
      ["zones", "density", "regions", "districts", "roads", "rivers", "protected_areas"].includes(l)
    );
    state.hiddenLayers = layers.filter((l) =>
      ["assets", "boundaries"].includes(l)
    );
  }

  const rad = params.get("rad");
  if (rad) {
    const [rlat, rlng, rm] = rad.split(",").map(Number);
    if (
      Number.isFinite(rlat) &&
      Number.isFinite(rlng) &&
      Number.isFinite(rm) &&
      rm > 0
    ) {
      state.spatial = {
        kind: "radius",
        center: [rlat, rlng],
        radiusM: Math.min(200000, rm),
      };
    }
  }

  const filters: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith("f.") && value) filters[key.slice(2)] = value;
  }
  if (Object.keys(filters).length > 0) state.filters = filters;

  return state;
}

/** Serialize current state into URLSearchParams. Defaults are omitted so
 * permalinks stay short; stale keys disappear because the list is built
 * from scratch on every call. */
export function serializeAtlasState(
  state: AtlasUrlState,
  defaults: { center: [number, number]; zoom: number }
): URLSearchParams {
  const params = new URLSearchParams();

  const movedCenter =
    !state.center ||
    Math.abs(state.center[0] - defaults.center[0]) > 0.0001 ||
    Math.abs(state.center[1] - defaults.center[1]) > 0.0001;
  if (state.center && movedCenter) {
    params.set("lat", state.center[0].toFixed(4));
    params.set("lng", state.center[1].toFixed(4));
  }
  if (state.zoom && Math.abs(state.zoom - defaults.zoom) > 0.05) {
    params.set("z", String(state.zoom));
  }

  if (state.basemap && state.basemap !== "grey") params.set("bm", state.basemap);

  if (state.yearRange) {
    params.set("y0", String(state.yearRange[0]));
    params.set("y1", String(state.yearRange[1]));
  }

  if (state.selectedId) params.set("sel", state.selectedId);

  if (state.query) params.set("q", state.query);

  const layerParts = [...(state.hiddenLayers ?? []), ...(state.layers ?? [])];
  if (layerParts.length > 0) params.set("layers", layerParts.join(","));

  if (state.spatial && state.spatial.kind === "radius") {
    const s = state.spatial;
    params.set(
      "rad",
      `${s.center[0].toFixed(4)},${s.center[1].toFixed(4)},${Math.round(s.radiusM)}`
    );
  }

  if (state.filters) {
    for (const [key, value] of Object.entries(state.filters)) {
      if (value) params.set(`f.${key}`, value);
    }
  }

  return params;
}
