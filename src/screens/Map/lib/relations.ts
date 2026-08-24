import type { HeritageAsset } from "../components/HeritageLayer";
import { assetPoint, haversineKm } from "./atlas";

export interface RelatedAsset {
  asset: HeritageAsset;
  distanceKm?: number;
}

const sameId = (a: HeritageAsset, b: HeritageAsset) =>
  String(a.id) === String(b.id);

export function computeNearby(
  target: HeritageAsset,
  pool: HeritageAsset[],
  limit = 6,
  maxKm = 50
): RelatedAsset[] {
  const origin = assetPoint(target);
  if (!origin) return [];
  const out: RelatedAsset[] = [];
  for (const asset of pool) {
    if (sameId(asset, target)) continue;
    const pt = assetPoint(asset);
    if (!pt) continue;
    const km = haversineKm(origin, pt);
    if (km > maxKm) continue;
    out.push({ asset, distanceKm: km });
  }
  return out
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    .slice(0, limit);
}

export type RelationKind =
  | "nearby"
  | "period"
  | "culture"
  | "type"
  | "historical";

export const RELATION_LABELS: Array<{
  kind: RelationKind;
  label: string;
}> = [
  { kind: "nearby", label: "Nearby" },
  { kind: "historical", label: "Historically Related" },
  { kind: "period", label: "Same Historical Period" },
  { kind: "culture", label: "Same Cultural Association" },
  { kind: "type", label: "Same Asset Type" },
];

const periodsOverlap = (
  a: HeritageAsset,
  b: HeritageAsset
): boolean => {
  const a0 = a.period_start ?? -Infinity;
  const a1 = a.period_end ?? Infinity;
  const b0 = b.period_start ?? -Infinity;
  const b1 = b.period_end ?? Infinity;
  return a0 <= b1 && b0 <= a1;
};

export function computeRelated(
  target: HeritageAsset,
  pool: HeritageAsset[],
  limit = 6
): Record<RelationKind, RelatedAsset[]> {
  const nearby = computeNearby(target, pool, limit);

  const byField = (field: keyof HeritageAsset): RelatedAsset[] =>
    pool
      .filter(
        (a) =>
          !sameId(a, target) &&
          Boolean(target[field]) &&
          String(a[field]) === String(target[field])
      )
      .slice(0, limit)
      .map((asset) => ({ asset }));

  const historical: RelatedAsset[] = pool
    .filter(
      (a) =>
        !sameId(a, target) &&
        target.district &&
        a.district === target.district &&
        periodsOverlap(target, a)
    )
    .slice(0, limit)
    .map((asset) => {
      const o = assetPoint(target);
      const p = assetPoint(asset);
      return o && p
        ? { asset, distanceKm: haversineKm(o, p) }
        : { asset };
    });

  return {
    nearby,
    period: byField("period"),
    culture: byField("cultural_group"),
    type: byField("asset_category"),
    historical,
  };
}
