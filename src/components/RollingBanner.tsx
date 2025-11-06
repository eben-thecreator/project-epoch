import React, { useEffect, useRef, useState } from "react";

interface Exhibition {
  id: string;
  title: string;
  location: string;
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string;   // Format: "YYYY-MM-DD"
}

const EXHIBITIONS: Exhibition[] = [
  {
    id: "digital-heritage",
    title: "Digital Heritage Exhibition",
    location: "National Museum of Ghana, Accra",
    startDate: "2025-11-15",
    endDate: "2026-02-28"
  },
  {
    id: "traditional-crafts",
    title: "Traditional Crafts Showcase",
    location: "Nigeria National Museum, Lagos",
    startDate: "2025-12-01",
    endDate: "2026-03-15"
  },
  {
    id: "royal-artifacts",
    title: "Royal Benin Artifacts",
    location: "Royal Palace Museum, Benin City",
    startDate: "2025-11-20",
    endDate: "2026-01-31"
  },
  {
    id: "contemporary-art",
    title: "Contemporary West African Art",
    location: "Museum of West African Art, Abidjan",
    startDate: "2025-11-10",
    endDate: "2026-02-15"
  }
];

export const RollingBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(30); // Default duration

  useEffect(() => {
    const calculateDuration = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = containerRef.current.scrollWidth / 2; // Divide by 2 because we duplicate the content
        // Calculate duration based on content width (pixels per second)
        const newDuration = Math.max(contentWidth / 100, 10); // Minimum 10 seconds
        setDuration(newDuration);
      }
    };

    calculateDuration();
    window.addEventListener('resize', calculateDuration);
    return () => window.removeEventListener('resize', calculateDuration);
  }, []);

  return (
    <div className="bg-black text-white py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={containerRef}
          className="flex"
          style={{ 
            animation: `roll ${duration}s linear infinite`,
            width: 'fit-content'
          }}
        >
        {EXHIBITIONS.map((exhibition) => (
          <div key={`${exhibition.id}-1`} className="flex items-center whitespace-nowrap mx-4">
            <span className="font-medium">
              {exhibition.title} | {exhibition.location} | {exhibition.startDate} to {exhibition.endDate}
            </span>
            <span className="mx-2">•</span>
            <span className="text-yellow-400 font-bold">EXHIBITION</span>
          </div>
        ))}
        {/* Duplicate items for seamless looping */}
        {EXHIBITIONS.map((exhibition) => (
          <div key={`${exhibition.id}-2`} className="flex items-center whitespace-nowrap mx-4">
            <span className="font-medium">
              {exhibition.title} | {exhibition.location} | {exhibition.startDate} to {exhibition.endDate}
            </span>
            <span className="mx-2">•</span>
            <span className="text-yellow-400 font-bold">EXHIBITION</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};