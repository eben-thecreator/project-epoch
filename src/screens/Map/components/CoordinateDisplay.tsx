import React, { useState, useEffect } from "react";
import { useMap } from "react-leaflet";

interface CoordinateDisplayProps {
  darkMode?: boolean;
}

export const CoordinateDisplay: React.FC<CoordinateDisplayProps> = ({ darkMode = false }) => {
  const map = useMap();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on("mousemove", handleMouseMove);
    return () => {
      map.off("mousemove", handleMouseMove);
    };
  }, [map]);

  return (
    <div className="absolute bottom-4 left-4 max-sm:bottom-16 z-[1000] px-3 py-1.5">
      <span className="text-[12px] uppercase font-bold text-[#E4002B] tabular-nums">
        {coords
          ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
          : "— , —"}
      </span>
    </div>
  );
};

CoordinateDisplay.displayName = "CoordinateDisplay";
