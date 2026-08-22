export interface AssetGeometry {
  type: string;
  coordinates?: unknown;
  geometries?: unknown[];
}

export type LngLat = [number, number];
export type LatLng = [number, number];

interface Position {
  lng: number;
  lat: number;
}

const isPosition = (p: unknown): p is number[] =>
  Array.isArray(p) &&
  p.length >= 2 &&
  typeof p[0] === "number" &&
  typeof p[1] === "number";

/**
 * Area-weighted centroid of a closed ring using the shoelace formula.
 * Falls back to the vertex average for degenerate rings.
 */
const ringCentroid = (ring: number[][]): Position | null => {
  const pts = ring.filter(isPosition) as LngLat[];
  if (pts.length === 0) return null;
  let twiceArea = 0;
  let x = 0;
  let y = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [x0, y0] = pts[j];
    const [x1, y1] = pts[i];
    const f = x0 * y1 - x1 * y0;
    twiceArea += f;
    x += (x0 + x1) * f;
    y += (y0 + y1) * f;
  }
  if (Math.abs(twiceArea) < 1e-12) {
    // Degenerate ring — average the vertices instead.
    return {
      lng: pts.reduce((s, p) => s + p[0], 0) / pts.length,
      lat: pts.reduce((s, p) => s + p[1], 0) / pts.length,
    };
  }
  return { lng: x / (3 * twiceArea), lat: y / (3 * twiceArea) };
};

/** Midpoint along line length (not by vertex index). */
const lineMidpoint = (coords: number[][]): Position | null => {
  const pts = coords.filter(isPosition) as LngLat[];
  if (pts.length === 0) return null;
  if (pts.length === 1) return { lng: pts[0][0], lat: pts[0][1] };

  // Approximate segment lengths in degrees (fine for labelling/focus purposes).
  let total = 0;
  const segLens: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    segLens.push(len);
    total += len;
  }
  let target = total / 2;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= segLens[i]) {
      const t = segLens[i] === 0 ? 0 : target / segLens[i];
      return {
        lng: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
        lat: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
      };
    }
    target -= segLens[i];
  }
  const last = pts[pts.length - 1];
  return { lng: last[0], lat: last[1] };
};

const collectPositions = (geom: AssetGeometry | null | undefined): LngLat[] => {
  const out: LngLat[] = [];
  const walk = (node: unknown): void => {
    if (!Array.isArray(node)) return;
    if (isPosition(node)) {
      out.push(node as LngLat);
      return;
    }
    node.forEach(walk);
  };
  walk(geom?.coordinates);
  return out;
};

/** Best-effort representative centre of any geometry, in [lat, lng]. */
export const geometryCenter = (
  geom: AssetGeometry | undefined | null
): LatLng | null => {
  if (!geom) return null;

  if (geom.type === "Point") {
    const c = (geom as AssetGeometry).coordinates;
    return isPosition(c) ? [c[1], c[0]] : null;
  }

  if (geom.type === "MultiPoint" || geom.type === "LineString") {
    const mid = lineMidpoint((geom as AssetGeometry).coordinates as number[][]);
    return mid ? [mid.lat, mid.lng] : null;
  }

  if (geom.type === "MultiLineString") {
    const lines = (geom as AssetGeometry).coordinates as number[][][];
    for (const line of lines) {
      const mid = lineMidpoint(line);
      if (mid) return [mid.lat, mid.lng];
    }
    return null;
  }

  if (geom.type === "Polygon") {
    // Outer ring only
    const c = ringCentroid(((geom as AssetGeometry).coordinates as number[][][])?.[0] ?? []);
    return c ? [c.lat, c.lng] : null;
  }

  if (geom.type === "MultiPolygon") {
    // Centroid of the largest outer ring by absolute shoelace area
    const polys = (geom as AssetGeometry).coordinates as number[][][][];
    let best: { area: number; centre: Position | null } = { area: -1, centre: null };
    for (const poly of polys) {
      const ring = poly[0] ?? [];
      const pts = ring.filter(isPosition) as LngLat[];
      let area = 0;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        area += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
      }
      area = Math.abs(area);
      if (area > best.area) {
        best = { area, centre: ringCentroid(ring) };
      }
    }
    return best.centre ? [best.centre.lat, best.centre.lng] : null;
  }

  if (geom.type === "GeometryCollection") {
    for (const g of (geom.geometries ?? []) as AssetGeometry[]) {
      const c = geometryCenter(g);
      if (c) return c;
    }
  }

  return null;
};

/**
 * Geographic bounding box of a geometry in Leaflet order:
 * [[southLat, westLng], [northLat, eastLng]].
 */
export const geometryBounds = (
  geom: AssetGeometry | undefined | null
): [[number, number], [number, number]] | null => {
  if (!geom) return null;
  const positions = collectPositions(geom);
  if (positions.length === 0) return null;

  let south = Infinity;
  let north = -Infinity;
  let west = Infinity;
  let east = -Infinity;
  for (const [lng, lat] of positions) {
    if (lat < south) south = lat;
    if (lat > north) north = lat;
    if (lng < west) west = lng;
    if (lng > east) east = lng;
  }

  // Guard against antimeridian-crossing artefacts producing absurd boxes
  if (east - west > 180) {
    west = east; // degenerate fallback: collapse onto eastern edge
  }

  return [
    [south, west],
    [north, east],
  ];
};
