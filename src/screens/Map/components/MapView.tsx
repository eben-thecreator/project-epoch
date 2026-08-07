import React from "react";
import {
  MapContainer as LeafletMap,
  TileLayer,
  ScaleControl,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { CoordinateDisplay } from "./CoordinateDisplay";

interface MapViewProps {
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  darkMode?: boolean;
  flyTo?: { center: [number, number]; zoom: number } | null;
}

function MapController() {
  const map = useMap();
  React.useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

function MapFlyTo({
  target,
}: {
  target: { center: [number, number]; zoom: number } | null;
}) {
  const map = useMap();
  React.useEffect(() => {
    if (target) {
      map.flyTo(target.center, target.zoom, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  children,
  center = [7.9465, -1.0232],
  zoom = 7,
  darkMode = false,
  flyTo = null,
}) => {
  const lightTiles =
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const darkTiles =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <LeafletMap
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
        key={darkMode ? "dark" : "light"}
        url={darkMode ? darkTiles : lightTiles}
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />
      <ScaleControl imperial={false} position="bottomright" />
      {children}
      <CoordinateDisplay darkMode={darkMode} />
    </LeafletMap>
  );
};

MapView.displayName = "MapView";
