import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/Header";
import { apiUrl } from "../../lib/api";
import { getCatalogueCollection, type CatalogueCollectionKey } from "./catalogueConfig";

type MediaItem = {
  id: string;
  mediaType: string;
  filePath: string;
  fileName?: string | null;
  caption?: string | null;
  isPrimary?: boolean;
};

type HeritageRecord = {
  id: string;
  name?: string | null;
  alternative_name?: string | null;
  description?: string | null;
  asset_type?: string | null;
  asset_category?: string | null;
  region?: string | null;
  district?: string | null;
  community?: string | null;
  current_location?: string | null;
  created_at?: string | null;
  media?: MediaItem[];
};

type CollectionPageProps = {
  collectionKey: CatalogueCollectionKey;
};

const isMediaModel = (media?: MediaItem | null) => !!media && /\.(glb|gltf)$/i.test(media.filePath);

const getLocationLabel = (record: HeritageRecord) => {
  return record.region || record.district || record.community || record.current_location || "Location not recorded";
};

const getDisplayTitle = (record: HeritageRecord) => {
  return record.name || record.alternative_name || record.id;
};

const getPreviewMedia = (record: HeritageRecord) => {
  return record.media?.find((media) => media.isPrimary && media.mediaType === "image")
    || record.media?.find((media) => media.mediaType === "image")
    || record.media?.find((media) => media.isPrimary)
    || record.media?.[0]
    || null;
};

export const CollectionPage = ({ collectionKey }: CollectionPageProps): JSX.Element => {
  const config = getCatalogueCollection(collectionKey);
  const [records, setRecords] = useState<HeritageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(apiUrl(`/api/heritage-assets?collection=${collectionKey}`));

        if (!response.ok) {
          throw new Error("Unable to load collection records.");
        }

        const data = await response.json();
        setRecords(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load collection records.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, [collectionKey]);

  const totalMedia = useMemo(() => {
    return records.reduce((count, record) => count + (record.media?.length || 0), 0);
  }, [records]);

  if (!config) {
    return <div className="min-h-screen bg-white text-black"><Header /><main className="px-4 sm:px-6 lg:px-8 pt-24">Collection not found.</main></div>;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6 sticky lg:top-24 self-start">
            <div className="space-y-3 max-w-md">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/45">Catalogue Collection</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none">{config.title}</h1>
              <p className="text-sm font-medium leading-relaxed text-black/75">{config.intro}</p>
            </div>

            <div className="border border-black/10 p-4 sm:p-5 space-y-3 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-2 gap-3 text-[11px] uppercase tracking-widest font-bold text-black/60">
                <div className="border border-black/10 p-3">Records<br /><span className="text-black text-base font-black">{records.length}</span></div>
                <div className="border border-black/10 p-3">Media Items<br /><span className="text-black text-base font-black">{totalMedia}</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.chips.map((chip) => (
                  <span key={chip} className="border border-black/10 px-2 py-1 text-[10px] uppercase tracking-[0.28em] font-bold">
                    {chip}
                  </span>
                ))}
              </div>
              <Link
                to="/admin/media"
                className="inline-flex items-center justify-center border border-black px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold hover:bg-black hover:text-white transition-colors"
              >
                Attach Media in Admin
              </Link>
              <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-black/45">
                Only records in the active `project_epoch` database are shown here.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            {error && (
              <div className="border border-black/15 p-4 text-sm mb-4">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-xs uppercase tracking-widest text-black/60">Loading collection records...</div>
            ) : records.length === 0 ? (
              <div className="border border-dashed border-black/15 p-6 text-sm text-black/55">
                No records are currently classified in this collection.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {records.map((record) => {
                  const previewMedia = getPreviewMedia(record);
                  return (
                    <article
                      key={record.id}
                      className="border border-black/10 bg-[#fbfbfb] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.03)] group hover:border-black/25 transition-colors"
                    >
                      <div className="aspect-[4/3] bg-black/5 overflow-hidden flex items-center justify-center">
                        {previewMedia?.mediaType === "image" ? (
                          <img
                            src={apiUrl(previewMedia.filePath)}
                            alt={previewMedia.caption || getDisplayTitle(record)}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          />
                        ) : previewMedia && isMediaModel(previewMedia) ? (
                          <div className="px-4 text-center space-y-2">
                            <div className="text-xs uppercase tracking-widest font-bold text-black/60">3D Model</div>
                            <span className="inline-flex items-center justify-center border border-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.28em] font-bold text-black/50">
                              3D Model
                            </span>
                          </div>
                        ) : previewMedia ? (
                          <div className="text-center px-4 space-y-2">
                            <div className="text-xs uppercase tracking-widest font-bold text-black/60">{previewMedia.mediaType}</div>
                            <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Media attached</div>
                          </div>
                        ) : (
                          <div className="text-center px-4 space-y-2">
                            <div className="text-xs uppercase tracking-widest font-bold text-black/60">No Media</div>
                            <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Awaiting upload</div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-black uppercase leading-tight group-hover:underline">{getDisplayTitle(record)}</h2>
                            <p className="text-[11px] uppercase tracking-widest text-black/55 mt-1">{config.shortTitle}</p>
                          </div>
                          <div className="text-[10px] uppercase tracking-widest text-black/45">
                            {record.media?.length || 0} media
                          </div>
                        </div>

                        <p className="text-[11px] uppercase tracking-widest text-black/55">
                          {record.asset_type || "Unclassified"} • {record.asset_category || "Uncategorized"}
                        </p>
                        <p className="text-sm leading-relaxed text-black/75">
                          {record.description || "No description recorded yet."}
                        </p>
                        <p className="text-[11px] uppercase tracking-widest text-black/55">
                          {getLocationLabel(record)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
