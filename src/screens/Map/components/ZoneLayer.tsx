import { useMemo } from "react";
import { Circle } from "react-leaflet";
import type { HeritageAsset } from "./HeritageLayer";
import { assetPoint } from "../lib/atlas";
import { categoryColor } from "../../../lib/categories";

interface ZoneLayerProps {
  assets: HeritageAsset[];
  visible: boolean;
  darkTiles: boolean;
}

const MAX_ZONES = 600;
const ZONE_RADIUS_M = 750;

/**
 * Heritage zones — a quiet proximity wash around each documented point.
 * Reads only at district-and-closer zooms so national overviews keep the
 * marker field clean. Colour carries category; the dashed hairline and
 * label carry meaning for colour-blind readers (never colour alone).
 */
export const ZoneLayer: React.FC<ZoneLayerProps> = ({
  assets,
  visible,
  darkTiles,
}) => {
  const zones = useMemo(() => {
    if (!visible) return [];
    return assets
      .filter((a) => a.geometry?.type === "Point")
      .slice(0, MAX_ZONES)
      .map((a) => ({ asset: a, point: assetPoint(a) }))
      .filter((z): z is { asset: HeritageAsset; point: [number, number] } => z.point !== null);
  }, [assets, visible]);

  if (!visible || zones.length === 0) return null;

  return (
    <>
      {zones.map(({ asset, point }) => {
        const color = categoryColor(asset.asset_category, darkTiles);
        return (
          <Circle
            key={`zone-${asset.id}`}
            center={point}
            radius={ZONE_RADIUS_M}
            pathOptions={{
              color,
              weight: 1,
              opacity: darkTiles ? 0.35 : 0.3,
              dashArray: "2 4",
              fillColor: color,
              fillOpacity: darkTiles ? 0.07 : 0.05,
            }}
            interactive={false}
          />
        );
      })}
    </>
  );
};

ZoneLayer.displayName = "ZoneLayer";
