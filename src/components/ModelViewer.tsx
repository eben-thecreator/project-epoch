import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, Bounds } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  modelUrl: string;
  backgroundColor?: string;
  autoRotate?: boolean;
}

// Error boundary for the 3D model viewer
class ModelErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("Model Error Boundary caught an error:", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Model Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return React.createElement("div", { className: "w-full h-full flex items-center justify-center bg-gray-100" },
        React.createElement("div", { className: "text-center text-gray-500" },
          React.createElement("svg", { className: "w-12 h-12 mx-auto text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 011.414-0.586H14l2 2v2a2 2 0 01-2 2h-4.172a2 2 0 00-1.414 0.586L4 16z" }),
            React.createElement("circle", { cx: "18", cy: "18", r: "2" }),
            React.createElement("path", { d: "M8.586 4H4a2 2 0 00-2 2v4l2.586-2.586a1 1 0 011.414 0L10 9.414l2-2a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414l5.414-5.414a2 2 0 001.414-1.414L16 8h4a2 2 0 002-2V4a2 2 0 00-2-2h-4.586a1 1 0 00-.707.293l-6 6a1 1 0 000 1.414l6 6a1 1 0 00.707.293z" })
          ),
          React.createElement("p", { className: "mt-2" }, "Error loading 3D model")
        )
      );
    }

    return this.props.children;
  }
}

const Model: React.FC<{ modelUrl: string; autoRotate?: boolean }> = ({ modelUrl, autoRotate = false }) => {
  const { scene } = useGLTF(modelUrl);
  const modelRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (autoRotate && modelRef.current) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  // Clone the scene to allow multiple instances
  const model = scene.clone(true);
  
  // Ensure textures are properly loaded
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        // Handle both single materials and material arrays
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          // Type assertion to THREE.Material with optional texture maps
          const mat = material as THREE.Material & {
            map?: THREE.Texture;
            roughnessMap?: THREE.Texture;
            metalnessMap?: THREE.Texture;
            normalMap?: THREE.Texture;
            emissiveMap?: THREE.Texture;
          };

          if (mat.map) {
            mat.map.anisotropy = 16;
          }
          if (mat.roughnessMap) {
            mat.roughnessMap.anisotropy = 16;
          }
          if (mat.metalnessMap) {
            mat.metalnessMap.anisotropy = 16;
          }
          if (mat.normalMap) {
            mat.normalMap.anisotropy = 16;
          }
          if (mat.emissiveMap) {
            mat.emissiveMap.anisotropy = 16;
          }

          material.needsUpdate = true;
        });
      }
    }
  });
  
  return React.createElement("group", { ref: modelRef },
    React.createElement("primitive", { object: model })
  );
};

export const ModelViewer: React.FC<ModelViewerProps> = ({ 
  modelUrl, 
  backgroundColor = "#f3f4f6",
  autoRotate = false
}) => {
  // Check if modelUrl is valid
  if (!modelUrl) {
    return React.createElement("div", { className: "w-full h-full flex items-center justify-center", style: { background: backgroundColor } },
      React.createElement("div", { className: "text-center text-gray-500" },
        React.createElement("svg", { className: "w-12 h-12 mx-auto text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
          React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 011.414-0.586H14l2 2v2a2 2 0 01-2 2h-4.172a2 2 0 00-1.414 0.586L4 16z" }),
          React.createElement("circle", { cx: "18", cy: "18", r: "2" }),
          React.createElement("path", { d: "M8.586 4H4a2 2 0 00-2 2v4l2.586-2.586a1 1 0 011.414 0L10 9.414l2-2a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414l5.414-5.414a2 2 0 001.414-1.414L16 8h4a2 2 0 002-2V4a2 2 0 00-2-2h-4.586a1 1 0 00-.707.293l-6 6a1 1 0 000 1.414l6 6a1 1 0 00.707.293z" })
        ),
        React.createElement("p", { className: "mt-2" }, "No model available")
      )
    );
  }

  // Add key to force re-creation when modelUrl changes
  const modelKey = React.useMemo(() => {
    return `${modelUrl}-${Date.now()}`;
  }, [modelUrl]);

  return React.createElement("div", { className: "w-full h-full relative", style: { background: backgroundColor, zIndex: 50 } },
    React.createElement(ModelErrorBoundary, { children: null },
      React.createElement(Canvas, {
        camera: { position: [0, 0, 5], fov: 50 },
        gl: { antialias: true, alpha: true },
        shadows: true,
        key: modelKey
      },
        React.createElement("ambientLight", { intensity: 0.8 }),
        React.createElement("spotLight", { position: [10, 10, 10], angle: 0.15, penumbra: 1, intensity: 1, castShadow: true }),
        React.createElement("pointLight", { position: [-10, -10, -10], intensity: 0.5 }),
        React.createElement("directionalLight", { position: [5, 5, 5], intensity: 1 }),
        
        React.createElement(Suspense, { fallback: React.createElement("div", { className: "text-center w-full h-full flex items-center justify-center" }, "Loading model...") },
          React.createElement(Model, { modelUrl: modelUrl, autoRotate: autoRotate, key: modelKey })
        ),
        
        React.createElement(OrbitControls, { 
          enableZoom: true,
          enablePan: true,
          enableRotate: true,
          minDistance: 0.5,
          maxDistance: 100,
          autoRotate: autoRotate,
          autoRotateSpeed: 0.5
        }),
        
        React.createElement(Preload, { all: true })
      )
    )
  );
};