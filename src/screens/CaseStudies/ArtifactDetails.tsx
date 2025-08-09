import React from "react";
import { Header } from "../../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { getArtifactById } from "./artifactData";
import { ModelViewer } from "../../components/ModelViewer";

const ArtifactErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

export const ArtifactDetails = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const artifact = id ? getArtifactById(id) : null;

  if (!artifact) {
    return React.createElement("div", { className: "bg-white w-full min-h-screen" },
      React.createElement(Header, {}),
      React.createElement("div", { className: "mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col " },
        React.createElement("main", { className: "flex-grow flex flex-col justify-center py-12 " },
          React.createElement("div", { className: "max-w-6xl mx-auto" },
            React.createElement("div", { className: "text-center py-12" },
              React.createElement("h1", { className: "text-2xl font-bold text-black mb-4" },
                "Artifact Not Found"
              ),
              React.createElement("p", { className: "text-gray-600" },
                "The artifact you're looking for doesn't exist or has been removed."
              )
            )
          )
        )
      )
    );
  }

  const isModel = !!artifact.modelUrl;
  const displayUrl = artifact.modelUrl || artifact.imageUrl || "";

  // Preload the model or image
  React.useEffect(() => {
    if (isModel && artifact.modelUrl) {
      // Create a link element to preload the model
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = artifact.modelUrl;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    } else if (artifact.imageUrl) {
      // Create an image element to preload the image
      const img = new Image();
      img.src = artifact.imageUrl;
    }
  }, [isModel, artifact.modelUrl, artifact.imageUrl]);

  return React.createElement(ArtifactErrorBoundary, { children: null },
    React.createElement("div", { className: "bg-white w-full min-h-screen" },
      React.createElement(Header, {}),
      React.createElement("div", { className: "mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col pt-24" },
        React.createElement("main", { className: "flex-grow flex flex-col justify-center py-12" },
          React.createElement("div", { className: "flex flex-col md:flex-row gap-10" },

            // Left: Model or Image
            React.createElement("div", {
              className: "w-full md:w-1/2 md:fixed pt-24",
              style: {
                top: "8rem",
                maxWidth: "calc(50% - 40px)"
              }
            },
              React.createElement(Card, { className: "w-full border-none shadow-none" },
                React.createElement(CardContent, { className: "p-0" },
                  React.createElement("div", { className: "relative w-full", style: { paddingBottom: "75%" } },
                    React.createElement("div", { className: "absolute inset-0 flex items-center justify-center" },
                      isModel
                        ? React.createElement(ModelViewer, { modelUrl: displayUrl, autoRotate: false })
                        : React.createElement("img", {
                            src: displayUrl,
                            alt: artifact.title,
                            className: "w-full h-full object-contain"
                          })
                    ),
                    React.createElement("div", {
                      className: "absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
                    },
                      React.createElement("span", {}, isModel ? "3D Model" : "Image Preview")
                    )
                  )
                )
              )
            ),

            // Right: Metadata
            React.createElement("div", {
              className: "w-full md:w-1/2 md:ml-[calc(50%+20px)] flex flex-col justify-between"
            },

              // Back button
              React.createElement("div", { className: "mb-6" },
                React.createElement("button", {
                  onClick: () => navigate('/case-studies/artifacts'),
                  className: "flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                },
                  React.createElement("svg", {
                    className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24"
                  },
                    React.createElement("path", {
                      strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2,
                      d: "M10 19l-7-7m0 0l7-7m-7 7h18"
                    })
                  ),
                  "Back to Collection"
                )
              ),

              // Metadata Top
              React.createElement("div", { className: "grid grid-cols-2 gap-y-6 mb-8" },
                React.createElement("div", {},
                  React.createElement("p", { className: "text-black font-semibold" }, artifact.title),
                  React.createElement("p", { className: "text-gray-400 text-sm" }, "Title")
                ),
                React.createElement("div", { className: "text-right" },
                  React.createElement("p", { className: "text-black font-semibold" },
                    `${artifact.location}, ${artifact.date}`
                  ),
                  React.createElement("p", { className: "text-gray-400 text-sm" }, "Origin")
                ),
                React.createElement("div", {},
                  React.createElement("p", { className: "text-black font-semibold" }, artifact.currentLocation),
                  React.createElement("p", { className: "text-gray-400 text-sm" }, "Location")
                ),
                React.createElement("div", { className: "text-right" },
                  React.createElement("p", { className: "text-black font-semibold" }, artifact.weight),
                  React.createElement("p", { className: "text-gray-400 text-sm" }, "Weight")
                ),
                React.createElement("div", {}),
                React.createElement("div", { className: "text-right" },
                  React.createElement("p", { className: "text-black font-semibold" }, artifact.height),
                  React.createElement("p", { className: "text-gray-400 text-sm" }, "Height")
                )
              ),

              // Description
              React.createElement("div", { className: "mb-10" },
                React.createElement("p", { className: "text-gray-400 text-sm mb-1" }, "Description / History"),
                React.createElement("p", { className: "text-black font-semibold text-sm leading-relaxed" }, artifact.description)
              ),

              // Supporting Image
              React.createElement(Card, { className: "w-full border-none shadow-none" },
                React.createElement(CardContent, { className: "p-0" },
                  React.createElement("div", { className: "w-full aspect-[2/1] bg-gray-200" },
                    React.createElement("img", {
                      src: artifact.imageUrl,
                      alt: "Supporting visual",
                      className: "w-full h-full object-cover",
                      onError: (e: any) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'%3ENo image available%3C/text%3E%3C/svg%3E";
                      }
                    })
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};