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

  // Preload images when component mounts
  React.useEffect(() => {
    allArtifacts.forEach(artifact => {
      if (artifact.imageUrl) {
        const img = new Image();
        img.src = artifact.imageUrl;
      }
    });
  }, []);

  return React.createElement("div", { className: "bg-white w-full min-h-screen font-inter " },
    React.createElement(Header, {}),
    
    // Main content area
    React.createElement("main", { className: "px-4 sm:px-6 lg:px-8 pt-32 py-12 pt-32" },
      // Artifacts Section
      React.createElement("section", { className: "grid grid-cols-1 md:grid-cols-4 gap-8" },
        // Left Text
        React.createElement("div", { className: "col-span-1 md:sticky md:top-52 self-start" },
          React.createElement("div", { className: "space-y-4" },
            React.createElement("h2", { className: "text-sm font-bold text-black" }, `Artifacts (${allArtifacts.length})`),
            React.createElement("p", { className: "text-sm font-bold text-black leading-snug max-w-xs" },
              "This platform preserves and shares our cultural heritage through storytelling, interactive artifacts, and immersive digital experiences that connect the past with the present."
            ),
            // Video section below the text
            React.createElement("div", { className: "mt-4" },
              // Video element would go here
            )
          )
        ),

        // Right Grid
        React.createElement("div", { className: "col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
          allArtifacts.map((artifact) => 
            React.createElement("div", {
              key: artifact.id,
              className: "aspect-[7/6] w-full cursor-pointer hover:opacity-90 transition-opacity",
              onClick: () => handleArtifactClick(artifact.id)
            },
              React.createElement("img", {
                src: artifact.imageUrl,
                alt: artifact.title,
                className: "w-full h-full object-cover",
                onError: (e: any) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'%3ENo image available%3C/text%3E%3C/svg%3E";
                }
              }),
              React.createElement("div", { className: "pt-2 text-xs" },
                React.createElement("h3", { className: "font-bold text-black" }, artifact.title),
                React.createElement("div", { className: "flex space-x-2 mt-1" },
                  React.createElement("span", {}, artifact.date),
                  React.createElement("span", {}, "•"),
                  React.createElement("span", {}, artifact.location)
                )
              )
            )
          )
        )
      )
    )
  );
};