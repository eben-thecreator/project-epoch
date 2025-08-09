import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../../components/Header";
import { MuseumModelViewer } from "../../../components/MuseumModelViewer";
import { allMuseums } from "./museumData";

export const MuseumDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const museum = allMuseums.find(m => m.id === id);

  if (!museum) {
    return (
      <div className="bg-white w-full min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Museum Not Found</h1>
          <p className="text-gray-600">The museum you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate("/case-studies/museums")}
            className="mt-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Museums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen">
      {/* Absolute positioned header so it overlays hero */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <Header />
      </div>

      {/* Full-Screen Hero with 3D Model */}
      <div className="relative w-full h-screen z-10">
        {museum.modelUrl ? (
          <MuseumModelViewer
            modelUrl={museum.modelUrl}
            backgroundColor="#000000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">3D Model Not Available</p>
          </div>
        )}

        {/* Museum Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8 z-20">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{museum.title}</h1>
            <p className="text-white/90 mt-2">{museum.location} • {museum.type}</p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-30">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Museums
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 mb-8">
          <div>
            <p className="text-black font-semibold">{museum.title}</p>
            <p className="text-gray-400 text-sm">Title</p>
          </div>
          <div>
            <p className="text-black font-semibold">{museum.location}</p>
            <p className="text-gray-400 text-sm">Location</p>
          </div>
          <div>
            <p className="text-black font-semibold">{museum.type}</p>
            <p className="text-gray-400 text-sm">Type</p>
          </div>
          <div>
            <p className="text-black font-semibold">{museum.established || "N/A"}</p>
            <p className="text-gray-400 text-sm">Established</p>
          </div>
          <div>
            <p className="text-black font-semibold">{museum.collectionSize?.toLocaleString() || "N/A"}</p>
            <p className="text-gray-400 text-sm">Collection Size</p>
          </div>
          <div>
            <p className="text-black font-semibold">
              {museum.website ? (
                <a 
                  href={museum.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              ) : "N/A"}
            </p>
            <p className="text-gray-400 text-sm">Website</p>
          </div>
        </div>

        <div>
          <p className="text-gray-400 text-sm mb-1">Description</p>
          <p className="text-black font-semibold text-sm leading-relaxed">
            {museum.description}
          </p>
        </div>
      </div>
    </div>
  );
};