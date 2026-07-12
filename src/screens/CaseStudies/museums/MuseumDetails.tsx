import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "../../../components/Header";
import { ModelViewer } from "../../../components/ModelViewer";
import { apiUrl } from "../../../lib/api";

type MediaItem = {
  id: string;
  mediaType: string;
  filePath: string;
  caption?: string | null;
  isPrimary?: boolean;
};

type MuseumRecord = {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  established?: number;
  media: MediaItem[];
};

const mapApiToMuseum = (item: any): MuseumRecord => {
  const media: MediaItem[] = Array.isArray(item.media) ? item.media : [];

  return {
    id: item.id,
    title: item.name || item.alternative_name || item.id,
    location:
      item.current_location ||
      [item.region, item.district, item.community].filter(Boolean).join(", ") ||
      "Unknown",
    type: item.asset_category || item.asset_type || "Site",
    description: item.description || "No description recorded.",
    established: item.period_start ?? undefined,
    media,
  };
};

export const MuseumDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromMap = (location.state as any)?.from === "map";

  const [museum, setMuseum] = useState<MuseumRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(id)}`));
        if (response.ok) {
          const data = await response.json();
          const museumData = mapApiToMuseum(data);
          setMuseum(museumData);

          if (museumData.media.length > 0) {
            const defaultMedia =
              museumData.media.find((m) => m.mediaType === "model") ||
              museumData.media.find((m) => m.isPrimary) ||
              museumData.media[0];
            setActiveMedia(defaultMedia);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-white w-full min-h-screen">
        <Header />
        <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-40">
          <p className="text-xs uppercase tracking-widest text-black/50">Loading record…</p>
        </div>
      </div>
    );
  }

  if (notFound || !museum) {
    return (
      <div className="bg-white w-full min-h-screen">
        <Header />
        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
          <main className="flex-grow flex flex-col justify-center py-12">
            <div className="max-w-6xl mx-auto text-center py-12">
              <h1 className="text-2xl font-bold text-black mb-4">Record Not Found</h1>
              <p className="text-gray-600">
                The heritage site you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="mt-6 flex items-center mx-auto text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isModel = activeMedia?.mediaType === "model";
  const displayUrl = activeMedia ? apiUrl(activeMedia.filePath) : "";

  return (
    <div className="bg-white w-full min-h-screen">
      <Header />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col pt-24">
        <main className="flex-grow flex flex-col justify-center py-12">
          <div className="flex flex-col md:flex-row gap-10">

            {/* Left: Model or Image Main Viewer */}
            <div
              className="w-full md:w-1/2 md:fixed pt-24"
              style={{ top: "8rem", maxWidth: "calc(50% - 40px)" }}
            >
              <div className="w-full shadow-none border-none">
                <div className="p-0">
                  <div className="relative w-full overflow-hidden bg-black" style={{ paddingBottom: "75%" }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isModel
                        ? <ModelViewer modelUrl={displayUrl} backgroundColor="#000000" autoRotate={false} />
                        : displayUrl
                          ? <img src={displayUrl} alt={activeMedia?.caption || museum.title} className="w-full h-full object-contain" />
                          : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <span className="text-xs uppercase tracking-widest text-black/40">No media attached</span>
                            </div>
                          )
                      }
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Right: Metadata and Gallery */}
            <div className="w-full md:w-1/2 md:ml-[calc(50%+20px)] flex flex-col justify-between">

              {/* Back button */}
              <div className="mb-6">
                {fromMap ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate("/map")}
                      className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Map
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => navigate("/case-studies")}
                      className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      View in Collection
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Museum List
                  </button>
                )}
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-y-8 mb-10">
                <div className="col-span-2">
                  <h1 className="text-4xl font-light text-black mb-2">{museum.title}</h1>
                  <p className="text-gray-500">{museum.location}</p>
                </div>

                <div>
                  <p className="text-black font-medium">{museum.type}</p>
                  <p className="text-gray-400 text-sm">Type</p>
                </div>
                {museum.established !== undefined && (
                  <div>
                    <p className="text-black font-medium">{museum.established}</p>
                    <p className="text-gray-400 text-sm">Established</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-12">
                <p className="text-black font-medium leading-relaxed">{museum.description}</p>
              </div>

              {/* Gallery */}
              {museum.media.filter(m => m.mediaType === 'image').length > 0 && (
                <div className="mb-10">
                  <p className="text-sm font-medium text-gray-900 mb-4">Gallery</p>
                  <div className="flex flex-col gap-4">
                    {museum.media.filter(m => m.mediaType === 'image').map((m) => (
                      <div key={m.id} style={{ aspectRatio: "16/10" }}>
                        <img src={apiUrl(m.filePath)} alt={m.caption || ''} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};