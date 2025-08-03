import React from "react";
import { Header } from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { allArtifacts } from "./artifactData";

export const CaseStudies = (): JSX.Element => {
  const navigate = useNavigate();

  // Use first 3 artifacts for the preview
  const artifactItems = allArtifacts.slice(0, 3);

  // Define images for museum section
  const museumItems = [
    {
      image: "/images/caseStudies/museum1.jpg",
      title: "National Museum",
      location: "Accra, Ghana",
      type: "Historical"
    },
    {
      image: "/images/caseStudies/museum2.jpg",
      title: "Heritage Center",
      location: "Lagos, Nigeria",
      type: "Cultural"
    },
  ];

  const handleArtifactClick = (id: string) => {
    navigate(`/case-studies/${id}`);
  };

  return (
    <div className="bg-white w-full min-h-screen font-inter">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-12 pt-32 space-y-24">
        {/* Artifacts Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start relative">
          {/* Left Text */}
          <div className="col-span-1 flex flex-col justify-center h-full">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">Artifacts ({allArtifacts.length})</h2>
              <p className="text-sm font-bold text-black leading-snug max-w-xs">
                This platform preserves and shares our cultural heritage through
                storytelling, interactive artifacts, and immersive digital experiences
                that connect the past with the present.
              </p>
            </div>
          </div>

          {/* Right Grid */}
          <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative">
            <div 
              className="absolute top-0 right-0 -mt-8 pr-1 text-sm font-bold text-black cursor-pointer hover:underline"
              onClick={() => navigate('/case-studies/artifacts')}
            >
              Explore Collection →
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
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start relative">
          {/* Left Text */}
          <div className="col-span-1 flex flex-col justify-center h-full">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">Museum (17)</h2>
              <p className="text-sm font-bold text-black leading-snug max-w-xs">
                This platform preserves and shares our cultural heritage through
                storytelling, interactive artifacts, and immersive digital experiences
                that connect the past with the present.
              </p>
            </div>
          </div>

          {/* Right Grid */}
          <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <div className="absolute top-0 right-0 -mt-8 pr-1 text-sm font-bold text-black">
              Navigate Spaces
            </div>
            {museumItems.map((item, i) => (
              <div key={i} className="aspect-[480/270] w-full cursor-pointer group">
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
      </main>
    </div>
  );
};