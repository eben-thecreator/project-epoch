import React from "react";
import {
  MapContainer as LeafletMap,
  TileLayer,
  useMap,
} from "react-leaflet";
import type L from "leaflet";

export type Basemap = "grey" | "satellite";

export interface FlyToTarget {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]] | null;
}

interface MapViewProps {
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  basemap?: Basemap;
  flyTo?: FlyToTarget | null;
  onViewportChange?: (center: [number, number], zoom: number) => void;
  onMapReady?: (map: L.Map) => void;
}

function MapController({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();
  const readyRef = React.useRef(onMapReady);
  readyRef.current = onMapReady;
  React.useEffect(() => {
    readyRef.current?.(map);
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

/**
 * MapContainer ignores className updates after mount, so the grade class
 * must be synced onto the live container element whenever the basemap
 * changes -- otherwise satellite inherits the grey basemap's tile filter.
 */
function GradeSync({ graded }: { graded: boolean }) {
  const map = useMap();
  React.useEffect(() => {
    const container = map.getContainer();
    container.classList.toggle("atlas-grade", graded);
  }, [map, graded]);
  return null;
}

function MapFlyTo({ target }: { target: FlyToTarget | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (!target) return;
    if (target.bounds) {
      const [[s, w], [n, e]] = target.bounds;
      if (
        Number.isFinite(s) && Number.isFinite(w) &&
        Number.isFinite(n) && Number.isFinite(e)
      ) {
        map.flyToBounds(
          [
            [s, w],
            [n, e],
          ],
          { duration: 1.2, padding: [48, 48], maxZoom: 17 }
        );
        return;
      }
    }
    if (
      Array.isArray(target.center) &&
      !isNaN(target.center[0]) &&
      !isNaN(target.center[1])
    ) {
      map.flyTo(target.center, target.zoom, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

const TILE_LAYERS: Record<
  Basemap,
  { url: string; attribution: string; subdomains?: string; maxZoom: number }
> = {
  grey: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: "abcd",
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "&copy; <a href=\"https://www.esri.com/\">Esri</a> &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 18,
  },
};

export function basemapIsDark(bm: Basemap): boolean {
  return bm === "satellite";
}

export const MapView: React.FC<MapViewProps> = ({
  children,
  center = [7.9465, -1.0232],
  zoom = 7,
  basemap = "grey",
  flyTo = null,
  onViewportChange,
  onMapReady,
}) => {
  const tile = TILE_LAYERS[basemap];
  const graded = basemap !== "satellite";

  return (
    <LeafletMap
      preferCanvas={true}
      center={center}
      zoom={zoom}
      zoomControl={false}
      attributionControl={true}
      style={{ width: "100%", height: "100%" }}
      className={graded ? "atlas-grade" : ""}
      minZoom={5}
      maxZoom={18}
      maxBounds={[[-2, -6], [12, 4]]}
      maxBoundsViscosity={0.8}
    >
      <MapController onMapReady={onMapReady} />
      <GradeSync graded={graded} />
      <MapFlyTo target={flyTo} />
      <TileLayer
        key={basemap}
        url={tile.url}
        attribution={tile.attribution}
        subdomains={(tile.subdomains as never) ?? "abc"}
        maxNativeZoom={tile.maxZoom}
        maxZoom={18}
      />
      {children}
      <ViewportReporter onViewportChange={onViewportChange} />
    </LeafletMap>
  );
};

function ViewportReporter({
  onViewportChange,
}: {
  onViewportChange?: (center: [number, number], zoom: number) => void;
}) {
  const map = useMap();
  const cbRef = React.useRef(onViewportChange);
  cbRef.current = onViewportChange;

  React.useEffect(() => {
    if (!cbRef.current) return;
    let raf = 0;
    const report = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const c = map.getCenter();
        cbRef.current?.([c.lat, c.lng], Math.round(map.getZoom() * 10) / 10);
      });
    };
    report();
    map.on("moveend", report);
    map.on("zoomend", report);
    return () => {
      cancelAnimationFrame(raf);
      map.off("moveend", report);
      map.off("zoomend", report);
    };
  }, [map]);

  return null;
}

MapView.displayName = "MapView";
