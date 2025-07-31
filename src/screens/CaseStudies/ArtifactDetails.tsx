import React from "react";
import { Header } from "../../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { getArtifactById } from "./artifactData";

export const ArtifactDetails = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artifact = id ? getArtifactById(id) : null;

  if (!artifact) {
    return (
      <div className="bg-white w-full min-h-screen">
        <Header />
        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
          <main className="flex-grow flex flex-col justify-center py-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-black mb-4">
                  Artifact Not Found
                </h1>
                <p className="text-gray-600">
                  The artifact you're looking for doesn't exist or has been
                  removed.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        <main className="flex-grow flex flex-col justify-center py-12">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left: Main Image (4:3 ratio) */}
            <div className="w-full md:w-1/2">
              <Card className="w-full border-none shadow-none">
                <CardContent className="p-0">
                  <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                    <img
                      src={artifact.imageUrl}
                      alt={artifact.title}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Metadata */}
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              {/* Back button */}
              <div className="mb-6">
                <button
                  onClick={() => navigate('/case-studies/artifacts')}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Collection
                </button>
              </div>

              {/* Metadata Top */}
              <div className="grid grid-cols-2 gap-y-6 mb-8">
                <div>
                  <p className="text-black font-semibold">{artifact.title}</p>
                  <p className="text-gray-400 text-sm">Title</p>
                </div>
                <div className="text-right">
                  <p className="text-black font-semibold">
                    {artifact.location}, {artifact.date}
                  </p>
                  <p className="text-gray-400 text-sm">Origin</p>
                </div>

                <div>
                  <p className="text-black font-semibold">
                    {artifact.currentLocation}
                  </p>
                  <p className="text-gray-400 text-sm">Location</p>
                </div>
                <div className="text-right">
                  <p className="text-black font-semibold">{artifact.weight}</p>
                  <p className="text-gray-400 text-sm">Weight</p>
                </div>

                <div />
                <div className="text-right">
                  <p className="text-black font-semibold">{artifact.height}</p>
                  <p className="text-gray-400 text-sm">Height</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-10">
                <p className="text-gray-400 text-sm mb-1">Description / History</p>
                <p className="text-black font-semibold text-sm leading-relaxed">
                  {artifact.description}
                </p>
              </div>

             
              <Card className="w-full border-none shadow-none">
                <CardContent className="p-0">
                  <div className="w-full aspect-[2/1] bg-gray-200">
                    <img
                      src={artifact.imageUrl}
                      alt="Supporting visual"
                      className="w-full h-full object-cover opacity-70"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};