import React from "react";
import { Header } from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { allArtifacts } from "./artifactData";

export const Artifacts = (): JSX.Element => {
  const navigate = useNavigate();

  const handleArtifactClick = (id: string) => {
    navigate(`/case-studies/${id}`);
  };

  return (
    <div className="bg-white w-full min-h-screen font-inter ">
      <Header />
      
      {/* Main content area */}
      <main className="px-4 sm:px-6 lg:px-8 pt-32 py-12 pt-32">
        {/* Artifacts Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Text */}
          <div className="col-span-1 md:sticky md:top-12 self-start">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-black">Artifacts ({allArtifacts.length})</h2>
              <p className="text-sm font-bold text-black leading-snug max-w-xs">
                This platform preserves and shares our cultural heritage through
                storytelling, interactive artifacts, and immersive digital experiences
                that connect the past with the present.
              </p>
              {/* Video section below the text */}
              <div className="mt-4">
                {/* <video 
                  className="w-full h-auto "
                  controls
                  poster="/images/video-placeholder.jpg"
                >
                  <source src="/videos/artifact-showcase.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video> */}
              </div>
            </div>
          </div>

          {/* Right Grid */}
          <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allArtifacts.map((artifact, i) => (
              <div 
                key={i} 
                className="aspect-[7/6] w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleArtifactClick(artifact.id)}
              >
                <img 
                  src={artifact.imageUrl} 
                  alt={artifact.title} 
                  className="w-full h-full object-cover"
                />
                <div className="pt-2 text-xs">
                  <h3 className="font-bold text-black">{artifact.title}</h3>
                  <div className="flex space-x-2 mt-1">
                    <span>{artifact.date}</span>
                    <span>•</span>
                    <span>{artifact.location}</span>
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