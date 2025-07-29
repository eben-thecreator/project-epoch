import React from "react";
import { Header } from "../../components/Header";

export const CaseStudies = (): JSX.Element => {
  // Define images for artifacts section
  const artifactImages = [
    "/images/caseStudies/artifact1.jpg",
    "/images/caseStudies/artifact2.jpg",
    "/images/caseStudies/artifact3.jpg",
  ];

  // Define images for museum section
  const museumImages = [
    "/images/caseStudies/museum1.jpg",
    "/images/caseStudies/museum2.jpg",
  ];

  return (
    <div className="bg-white w-full min-h-screen font-inter">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-12 space-y-24">
        {/* Artifacts Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start relative">
          {/* Left Text */}
          <div className="col-span-1 flex flex-col justify-center h-full">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">Artifacts (33)</h2>
              <p className="text-sm font-bold text-black leading-snug max-w-xs">
                This platform preserves and shares our cultural heritage through
                storytelling, interactive artifacts, and immersive digital experiences
                that connect the past with the present.
              </p>
            </div>
          </div>

          {/* Right Grid */}
          <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative">
            <div className="absolute top-0 right-0 -mt-8 pr-1 text-sm font-bold text-black">
              Explore Collection
            </div>
            {artifactImages.map((image, i) => (
              <div key={i} className="aspect-[7/6] w-full">
                <img 
                  src={image} 
                  alt={`Artifact ${i+1}`} 
                  className="w-full h-full object-cover"
                />
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
            <div className="absolute top-0 right-0 -mt-6 pr-1 text-sm font-bold text-black">
              Navigate Spaces
            </div>
            {museumImages.map((image, i) => (
              <div key={i} className="aspect-[480/270] w-full">
                <img 
                  src={image} 
                  alt={`Museum ${i+1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};