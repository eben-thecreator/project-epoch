import React, { useState, useEffect } from "react";
import { Header } from "../../../components/Header";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ModelViewer } from "../../../components/ModelViewer";
import { apiUrl } from "../../../lib/api";

type MediaItem = {
  id: string;
  mediaType: string;
  filePath: string;
  fileName?: string | null;
  caption?: string | null;
  isPrimary?: boolean;
};

type AssetRecord = {
  id: string;
  title: string;
  date: string;
  location: string;
  currentLocation: string;
  description: string;
  weight: string;
  height: string;
  material?: string;
  condition?: string;
  assetCategory?: string;
  media: MediaItem[];
};

const mapApiToAsset = (item: any): AssetRecord => {
  const media: MediaItem[] = Array.isArray(item.media) ? item.media : [];

  return {
    id: item.id,
    title: item.name || item.alternative_name || item.id,
    date: item.period || item.estimated_age || "Unknown period",
    location:
      [item.region, item.district, item.community].filter(Boolean).join(", ") ||
      "Unknown",
    currentLocation: item.current_location || "—",
    description: item.description || "No description recorded.",
    weight: item.weight_kg ? `${item.weight_kg} kg` : "Unknown",
    height: item.height_m ? `${item.height_m} m` : "Unknown",
    material: item.material || undefined,
    condition: item.condition || undefined,
    assetCategory: item.asset_category || undefined,
    media,
  };
};

export const ArtifactDetails = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromMap = (location.state as any)?.from === "map";

  const [artifact, setArtifact] = useState<AssetRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const [allIds, setAllIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const [assetRes, listRes] = await Promise.all([
          fetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(id)}`)),
          fetch(apiUrl("/api/heritage-assets?collection=artifacts")),
        ]);

        if (assetRes.ok) {
          const data = await assetRes.json();
          const asset = mapApiToAsset(data);
          setArtifact(asset);

          if (asset.media.length > 0) {
            const defaultMedia =
              asset.media.find((m) => m.mediaType === "model") ||
              asset.media.find((m) => m.isPrimary && m.mediaType === "image") ||
              asset.media.find((m) => m.mediaType === "image") ||
              asset.media[0];
            setActiveMedia(defaultMedia);
          }
        } else {
          setNotFound(true);
        }

        if (listRes.ok) {
          const list = await listRes.json();
          const ids = list.map((a: any) => a.id);
          setAllIds(ids);
          setCurrentIndex(ids.indexOf(id));
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
      <div className="bg-white w-full h-screen overflow-hidden pt-[64px] pb-[40px]">
        <Header />
        <div className="h-full flex items-center justify-center">
          <p className="text-[10px] uppercase font-bold text-black/40">Loading record...</p>
        </div>
      </div>
    );
  }

  if (notFound || !artifact) {
    return (
      <div className="bg-white w-full h-screen overflow-hidden pt-[64px] pb-[40px]">
        <Header />
        <div className="h-full flex flex-col items-center justify-center">
          <h1 className="text-lg font-black uppercase text-black mb-2">Record Not Found</h1>
          <p className="text-xs text-black/50 mb-6">
            The heritage record you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-[10px] uppercase font-bold text-black/50 hover:text-black transition-colors"
          >
            <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isModel = activeMedia?.mediaType === "model";
  const displayUrl = isModel && activeMedia ? apiUrl(activeMedia.filePath) : "";
  const imageMedia = artifact.media.filter((m) => m.mediaType === "image");
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allIds.length - 1;

  const goToItem = (direction: "prev" | "next") => {
    if (direction === "prev" && hasPrev) {
      navigate(`/case-studies/${allIds[currentIndex - 1]}`);
    } else if (direction === "next" && hasNext) {
      navigate(`/case-studies/${allIds[currentIndex + 1]}`);
    }
  };

  return (
    <div className="bg-white w-full h-screen pt-[64px] pb-[40px]">
      <Header />

      <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-8 min-h-0 px-4 sm:px-6 lg:px-8">
        {/* Left: Model viewer — fills remaining height, centered */}
        <div className="col-span-1 md:col-span-6 flex items-center justify-center">
          <div className="w-full h-full py-4">
            {isModel ? (
              <ModelViewer modelUrl={displayUrl} autoRotate={false} />
            ) : (
              <span className="text-[10px] uppercase font-bold text-black/30">No model available</span>
            )}
          </div>
        </div>

        {/* Right: Details — scrollable */}
        <div className="col-span-1 md:col-span-6 md:col-start-7 flex flex-col">
          <div className="py-6 lg:py-8 space-y-6 flex-1">
            {/* Title row with Back to Collection */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-black uppercase leading-tight text-black">{artifact.title}</h1>
              <button
                onClick={() => navigate("/case-studies/artifacts")}
                className="group flex items-center text-[10px] uppercase font-bold text-black/50 hover:text-black transition-colors whitespace-nowrap flex-shrink-0"
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-3 h-3 mr-1.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Collection</span>
              </button>
            </div>

            <p className="text-[10px] uppercase font-bold text-black/50">
              {[artifact.location, artifact.date].filter(Boolean).join(" · ")}
            </p>

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-black/50 mb-1">Location</p>
                <p className="text-sm font-bold text-black">{artifact.currentLocation}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-black/50 mb-1">Weight</p>
                <p className="text-sm font-bold text-black">{artifact.weight}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-black/50 mb-1">Height</p>
                <p className="text-sm font-bold text-black">{artifact.height}</p>
              </div>
              {artifact.material && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-black/50 mb-1">Material</p>
                  <p className="text-sm font-bold text-black">{artifact.material}</p>
                </div>
              )}
              {artifact.assetCategory && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-black/50 mb-1">Category</p>
                  <p className="text-sm font-bold text-black">{artifact.assetCategory}</p>
                </div>
              )}
              {artifact.condition && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-black/50 mb-1">Condition</p>
                  <p className="text-sm font-bold text-black">{artifact.condition}</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-[10px] uppercase font-bold text-black/40 mb-3">Description</p>
              <p className="text-sm text-black/70 leading-relaxed">{artifact.description}</p>
            </div>

            {/* Gallery thumbnails */}
            {imageMedia.length > 0 && (
              <div className="space-y-2">
                {imageMedia.map((m) => (
                  <div
                    key={m.id}
                    className="block w-full"
                  >
                    <div className="aspect-[16/10] bg-black/5 overflow-hidden">
                      <img
                        src={apiUrl(m.filePath)}
                        alt={m.caption || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prev / Next — pinned to bottom of details */}
          {allIds.length > 0 && (
            <div className="flex-shrink-0 border-t border-black/10 py-6 lg:py-8">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => goToItem("prev")}
                  disabled={!hasPrev}
                  className={`flex items-center text-[10px] uppercase font-bold transition-colors ${hasPrev ? "text-black/50 hover:text-black" : "text-black/20 cursor-not-allowed"
                    }`}
                >
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>

                <span className="text-[10px] font-bold text-black/30">
                  {currentIndex >= 0 ? currentIndex + 1 : "—"} / {allIds.length}
                </span>

                <button
                  onClick={() => goToItem("next")}
                  disabled={!hasNext}
                  className={`flex items-center text-[10px] uppercase font-bold transition-colors ${hasNext ? "text-black/50 hover:text-black" : "text-black/20 cursor-not-allowed"
                    }`}
                >
                  Next
                  <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
