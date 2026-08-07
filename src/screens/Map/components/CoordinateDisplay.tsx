import React, { useState, useEffect } from "react";
import { useMap } from "react-leaflet";

interface CoordinateDisplayProps {
  darkMode?: boolean;
}

function formatCoord(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  const absLat = Math.abs(lat).toFixed(4).padStart(7, "0");
  const absLng = Math.abs(lng).toFixed(4).padStart(7, "0");
  return `${absLat}° ${latDir}  ${absLng}° ${lngDir}`;
}

export const CoordinateDisplay: React.FC<CoordinateDisplayProps> = ({
  darkMode = false,
}) => {
  const map = useMap();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [zoom, setZoom] = useState<number>(map.getZoom());

  useEffect(() => {
    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    const handleZoomEnd = () => {
      setZoom(map.getZoom());
    };

    map.on("mousemove", handleMouseMove);
    map.on("zoomend", handleZoomEnd);
    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("zoomend", handleZoomEnd);
    };
  }, [map]);

  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/15" : "border-black/15";
  const text = darkMode ? "text-white/90" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";

  return (
    <div
      className={`absolute bottom-4 left-4 z-[1000] ${bg} border ${border} px-3 py-1.5 flex items-center gap-3 shadow-md pointer-events-none select-none`}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E4002B] animate-pulse" />
        <span className={`text-[9px] uppercase font-mono tracking-widest ${muted}`}>
          GPS
        </span>
      </div>
      <span
        className={`text-[10px] font-mono tracking-wider font-semibold ${text} tabular-nums`}
      >
        {coords ? formatCoord(coords.lat, coords.lng) : "07.9465° N  01.0232° W"}
      </span>
      <span className={`text-[9px] font-mono ${muted} pl-2 border-l ${darkMode ? "border-white/10" : "border-black/10"}`}>
        Z{zoom}
      </span>
    </div>
  );
};

CoordinateDisplay.displayName = "CoordinateDisplay";
