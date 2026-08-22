import React from "react";
import {
  MapContainer as LeafletMap,
  TileLayer,
  ScaleControl,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { CoordinateDisplay } from "./CoordinateDisplay";

export type Basemap = "light" | "dark" | "satellite";

export interface FlyToTarget {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]] | null;
}

interface MapViewProps {
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  darkMode?: boolean;
  basemap?: Basemap;
  flyTo?: FlyToTarget | null;
}

function MapController() {
  const map = useMap();
  React.useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function MapFlyTo({ target }: { target: FlyToTarget | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (!target) return;
    // Prefer fitting the true extent of the geometry when available
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

const TILE_LAYERS: Record<Basemap, { url: string; attribution: string; subdomains?: string }> = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
};

export const MapView: React.FC<MapViewProps> = ({
  children,
  center = [7.9465, -1.0232],
  zoom = 7,
  darkMode = false,
  basemap,
  flyTo = null,
}) => {
  // If no explicit basemap, infer from darkMode
  const activeBasemap: Basemap = basemap ?? (darkMode ? "dark" : "light");
  const tile = TILE_LAYERS[activeBasemap];

  return (
    <LeafletMap
      preferCanvas={true}
      center={center}
      zoom={zoom}
      zoomControl={false}
      attributionControl={true}
      style={{ width: "100%", height: "100%" }}
      minZoom={5}
      maxZoom={18}
      maxBounds={[[-2, -6], [12, 4]]}
      maxBoundsViscosity={0.8}
    >
      <MapController />
      <MapFlyTo target={flyTo} />
      <ZoomControl
        position="topleft"
        zoomInTitle="Zoom in"
        zoomOutTitle="Zoom out"
      />
      <TileLayer
        key={activeBasemap}
        url={tile.url}
        attribution={tile.attribution}
        subdomains={(tile.subdomains as any) ?? "abc"}
      />
      <ScaleControl imperial={false} position="bottomright" />
      {children}
      <CoordinateDisplay darkMode={darkMode} />
    </LeafletMap>
  );
};

MapView.displayName = "MapView";

