import React from "react";
import { Header } from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiUrl } from "../../../lib/api";

export const Museum = (): JSX.Element => {
  const navigate = useNavigate();
  const [museums, setMuseums] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl("/api/heritage-assets?collection=museums"));
        const data = await response.json();
        setMuseums(data.map(item => ({
          id: item.id,
          title: item.name,
          location: item.current_location,
          type: item.asset_category,
          description: item.description,
          imageUrl: item.media.find((m: any) => m.mediaType === 'image')?.filePath ? apiUrl(item.media.find((m: any) => m.mediaType === 'image').filePath) : '',
          modelUrl: item.media.find((m: any) => m.mediaType === 'model')?.filePath
            ? apiUrl(item.media.find((m: any) => m.mediaType === 'model').filePath)
            : '',
        })));
      } catch (error) {
        console.error("Error fetching museums:", error);
      }
    };
    fetchData();
  }, []);

  const handleMuseumClick = (id: string) => {
    navigate(`/case-studies/museums/${id}`);
  };

  // Preload images when component mounts
  React.useEffect(() => {
    museums.forEach(museum => {
      if (museum.imageUrl) {
        const img = new Image();
        img.src = museum.imageUrl;
      }
    });
  }, [museums]);

  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-12 pt-28 md:pt-40">
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="col-span-1 md:col-span-3 md:sticky md:top-28 self-start">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">Museums & Monuments ({museums.length})</h2>
              <p className="text-sm font-bold text-black leading-snug max-w-xs">
                Explore our curated collection of museums that preserve and showcase West African cultural heritage through immersive exhibitions and digital experiences.
              </p>
              <div className="mt-4">
                {/* Video element would go here */}
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-8 md:col-start-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {museums.map((museum) => (
              <div
                key={museum.id}
                className="aspect-[480/270] w-full cursor-pointer group hover:opacity-90 transition-opacity"
                onClick={() => handleMuseumClick(museum.id)}
              >
                <img
                  src={museum.imageUrl}
                  alt={museum.title}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'%3ENo image available%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="pt-2 text-xs">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-black">{museum.title}</h3>
                    <div className="text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-1">
                    <span>{museum.location}</span>
                    <span>•</span>
                    <span>{museum.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};