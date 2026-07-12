import { Header } from "../../components/Header";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiUrl } from "../../lib/api";

export const CaseStudies = (): JSX.Element => {
  const navigate = useNavigate();
  const [artifactItems, setArtifactItems] = useState<any[]>([]);
  const [museumItems, setMuseumItems] = useState<any[]>([]);
  const [documentItems, setDocumentItems] = useState<any[]>([]);
  const [catalogueSummary, setCatalogueSummary] = useState<any>({ artifacts: 0, museums: 0, textiles: 0, documents: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch catalogue summary for counts
        const summaryResponse = await fetch(apiUrl("/api/catalogue/summary"));
        const summaryData = await summaryResponse.json();
        setCatalogueSummary(summaryData);

        // Fetch first 3 artifacts
        const artifactsResponse = await fetch(apiUrl("/api/heritage-assets?collection=artifacts"));
        const artifactsData = await artifactsResponse.json();
        setArtifactItems(artifactsData.slice(0, 3).map(item => ({
          id: item.id,
          title: item.name,
          date: item.period || item.estimated_age,
          location: item.region || item.community,
          currentLocation: item.current_location,
          description: item.description,
          imageUrl: item.media.find((m: any) => m.mediaType === 'image')?.filePath ? apiUrl(item.media.find((m: any) => m.mediaType === 'image').filePath) : '',
          modelUrl: item.media.find((m: any) => m.mediaType === 'model')?.filePath
            ? apiUrl(item.media.find((m: any) => m.mediaType === 'model').filePath)
            : '',
          weight: item.weight_kg ? `${item.weight_kg} kg` : 'Unknown',
          height: item.height_m ? `${item.height_m} m` : 'Unknown',
        })));

        // Fetch first 2 museums
        const museumsResponse = await fetch(apiUrl("/api/heritage-assets?collection=museums"));
        const museumsData = await museumsResponse.json();
        setMuseumItems(museumsData.slice(0, 2).map(item => ({
          id: item.id,
          image: item.media.find((m: any) => m.mediaType === 'image')?.filePath ? apiUrl(item.media.find((m: any) => m.mediaType === 'image').filePath) : '',
          title: item.name,
          location: item.current_location,
          type: item.asset_category,
        })));

        // Fetch first 3 documents
        const documentsResponse = await fetch(apiUrl("/api/heritage-assets?collection=documents"));
        const documentsData = await documentsResponse.json();
        setDocumentItems(documentsData.slice(0, 3).map(item => ({
          id: item.id,
          title: item.name,
          date: item.period || item.estimated_age,
          location: item.region || item.community,
          imageUrl: item.media.find((m: any) => m.mediaType === 'image')?.filePath ? apiUrl(item.media.find((m: any) => m.mediaType === 'image').filePath) : '',
        })));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleArtifactClick = (id: string) => {
    navigate(`/case-studies/${id}`);
  };

  return (
    <div className="bg-white w-full min-h-screen ">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-12 pt-28 md:pt-40 space-y-24">
        {/* Artifacts Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">
          {/* Left Text */}
          <div className="col-span-1 md:col-span-3 md:top-52 self-start">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">Artifacts ({catalogueSummary.artifacts || 0})</h2>
              <p className="text-sm font-bold text-black leading-snug max-w-xs">
                This platform preserves and shares our cultural heritage through
                storytelling, interactive artifacts, and immersive digital experiences
                that connect the past with the present.
              </p>
            </div>
          </div>

          {/* Right Grid */}
          <div className="col-span-1 md:col-span-8 md:col-start-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative">
            <div
              className="group absolute top-0 right-0 -mt-8 text-black font-bold flex items-center text-[10px] uppercase cursor-pointer select-none"
              onClick={() => navigate('/case-studies/artifacts')}
            >
              <span className="transition-transform duration-300 whitespace-nowrap group-hover:-translate-x-5">
                Explore Collection
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="absolute right-0 w-3.5 h-3.5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            {artifactItems.map((item, i) => (
              <div
                key={i}
                className="aspect-[7/6] w-full cursor-pointer group"
                onClick={() => handleArtifactClick(item.id)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="pt-2 text-xs">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-black">{item.title}</h3>
                    {/* View text that appears on hover, aligned with the title */}
                    <div className="text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-1">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Museum Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">
          {/* Left Text */}
          <div className="col-span-1 md:col-span-3 md:top-52 self-start">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">Museum ({catalogueSummary.museums || 0})</h2>
              <p className="text-sm font-bold text-black leading-snug max-w-xs">
                This platform preserves and shares our cultural heritage through
                storytelling, interactive artifacts, and immersive digital experiences
                that connect the past with the present.
              </p>
            </div>
          </div>

          {/* Right Grid */}
          <div className="col-span-1 md:col-span-8 md:col-start-5 grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <div
              className="group absolute top-0 right-0 -mt-8 text-black font-bold flex items-center text-[10px] uppercase cursor-pointer select-none"
              onClick={() => navigate('/case-studies/museums')}
            >
              <span className="transition-transform duration-300 whitespace-nowrap group-hover:-translate-x-5">
                Explore Collection
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="absolute right-0 w-3.5 h-3.5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            {museumItems.map((item, i) => (
              <div key={i} className="aspect-[480/270] w-full cursor-pointer group" onClick={() => navigate(`/case-studies/museums/${item.id}`)}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="pt-2 text-xs">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-black">{item.title}</h3>
                    {/* View text that appears on hover, aligned with the title */}
                    <div className="text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-1">
                    <span>{item.location}</span>
                    <span>•</span>
                    <span>{item.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Textiles & Fabrics Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">
          {/* Left Text */}
          <div className="col-span-1 md:col-span-3 md:top-52 self-start">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">Materials & Textiles ({catalogueSummary.textiles || 0})</h2>
              <p className="text-sm font-bold text-black leading-snug max-w-xs">
                Discover the history, stories, and craftsmanship of Materials and Textiles, including the symbolic meanings woven into Kente cloth.
              </p>
            </div>
          </div>

          {/* Right — Single image + button */}
          <div className="col-span-1 md:col-span-8 md:col-start-5">
            <div className="relative w-full h-[240px]">
              <img
                src="/images/mat1.jpg"
                alt="Materials & Textiles"
                className="w-full h-full object-cover"
              />
              <Link
                to="/case-studies/textiles"
                className="group absolute bottom-0 right-0 bg-black text-white font-bold px-10 py-4 flex items-center justify-center overflow-hidden text-[10px] uppercase"
              >
                <span className="transition-transform duration-300 group-hover:-translate-x-3">
                  Explore Materials
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="absolute right-8 w-3.5 h-3.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Documents & Digital Media Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">
          {/* Left Text */}
          <div className="col-span-1 md:col-span-3 md:top-52 self-start">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">Documents & Digital Media ({catalogueSummary.documents || 0})</h2>
              <p className="text-sm font-bold text-black leading-snug max-w-xs">
                Browse historical documents, photographs, digital archives, maps, and audio recordings that preserve the stories and events of our shared heritage.
              </p>
            </div>
          </div>

          {/* Right Grid */}
          <div className="col-span-1 md:col-span-8 md:col-start-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative">
            <div
              className="group absolute top-0 right-0 -mt-8 text-black font-bold flex items-center text-[10px] uppercase cursor-pointer select-none"
              onClick={() => navigate('/case-studies/documents')}
            >
              <span className="transition-transform duration-300 whitespace-nowrap group-hover:-translate-x-5">
                Explore Archive
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="absolute right-0 w-3.5 h-3.5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            {documentItems.map((item, i) => (
              <div
                key={i}
                className="aspect-[7/6] w-full cursor-pointer group"
                onClick={() => handleArtifactClick(item.id)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="pt-2 text-xs">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-black">{item.title}</h3>
                    <div className="text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-1">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.location}</span>
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
