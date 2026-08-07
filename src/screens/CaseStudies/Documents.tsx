import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { apiUrl } from "../../lib/api";

type MediaItem = {
  id: string;
  mediaType: string;
  filePath: string;
  fileName?: string | null;
  caption?: string | null;
  isPrimary?: boolean;
};

type DocumentRecord = {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
};

const getPreviewImage = (media: MediaItem[]): string => {
  const image = media.find((m) => m.isPrimary && m.mediaType === "image")
    || media.find((m) => m.mediaType === "image")
    || media.find((m) => m.isPrimary)
    || media[0];
  return image ? apiUrl(image.filePath) : "";
};

export const Documents = (): JSX.Element => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl("/api/heritage-assets?collection=documents"));
        const data = await response.json();
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.name || item.alternative_name || "Untitled Document",
          location: [item.region, item.district, item.community].filter(Boolean).join(", ") || "Location not recorded",
          imageUrl: getPreviewImage(item.media || []),
        }));
        setDocuments(mapped);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <main className="pt-32 md:pt-36 px-4 sm:px-6 lg:px-8 pb-12 max-w-[1400px] mx-auto">
        {isLoading ? (
          <div className="text-[11px] uppercase tracking-widest text-black/45 py-20 text-center">
            Loading documents collection...
          </div>
        ) : documents.length === 0 ? (
          <div className="border border-dashed border-black/15 p-8 text-sm text-black/55 text-center">
            No documents currently recorded in the collection.
          </div>
        ) : (
          <div>
            {documents.map((doc) => (
              <article key={doc.id} className="border-b border-black/10">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 items-center py-10 md:py-14">
                  <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-1.5 md:pr-8">
                    <h2 className="text-lg md:text-xl font-medium text-black leading-snug">
                      {doc.name}
                    </h2>
                    <p className="text-[11px] uppercase tracking-widest text-black/45">
                      {doc.location}
                    </p>
                  </div>

                  <div className="w-full aspect-[16/10] bg-black/5 overflow-hidden">
                    {doc.imageUrl ? (
                      <img
                        src={doc.imageUrl}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-black/25">
                          No Media
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
