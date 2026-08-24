import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  OrbitControls,
  Preload,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";

interface ModelViewerProps {
  modelUrl: string;
  backgroundColor?: string;
  autoRotate?: boolean;
  rotateSpeed?: number;
}

const DRACO_DECODER_PATH = "/draco/gltf/";

/** Perceptual luminance of a hex colour, used to keep overlay text legible. */
const isDarkColor = (hex: string): boolean => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 128;
};

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

/**
 * Loading overlay — deliberately rendered as DOM *outside* the R3F canvas.
 * HTML elements cannot be rendered inside a <Canvas>, so Suspense's own
 * fallback must stay null and progress lives here instead.
 */
const LoadingOverlay = React.memo(({ dark }: { dark: boolean }) => {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-live="polite"
      aria-label="Loading 3D model"
    >
      <div className={`text-center ${dark ? "text-paper/60" : "text-black/50"}`}>
        <SearchIcon className={`w-10 h-10 mx-auto animate-pulse ${dark ? "text-paper/25" : "text-black/25"}`} />
        <p className="mt-2 text-xs font-bold tabular-nums">Loading model · {Math.round(progress)}%</p>
      </div>
    </div>
  );
});

LoadingOverlay.displayName = "LoadingOverlay";

/**
 * Catches loader/runtime errors raised inside the scene graph without
 * destroying the WebGL context, then reports them to the DOM layer.
 */
class SceneBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ModelViewer scene error:", error);
    this.props.onError();
  }

  render() {
    // Inside the canvas we can only render THREE objects — bail with null
    // and let the DOM overlay communicate the failure.
    return this.state.failed ? null : this.props.children;
  }
}

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url, DRACO_DECODER_PATH);

  // SkeletonUtils.clone keeps skinned/animated rigs intact; scene.clone(true)
  // silently breaks them.
  const model = useMemo(() => skeletonClone(scene), [scene]);

  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const mat = material as THREE.Material & Partial<Record<"map" | "roughnessMap" | "metalnessMap" | "normalMap" | "emissiveMap", THREE.Texture>>;
      mat.map &&= Object.assign(mat.map, { anisotropy: 16 });
      mat.roughnessMap &&= Object.assign(mat.roughnessMap, { anisotropy: 16 });
      mat.metalnessMap &&= Object.assign(mat.metalnessMap, { anisotropy: 16 });
      mat.normalMap &&= Object.assign(mat.normalMap, { anisotropy: 16 });
      mat.emissiveMap &&= Object.assign(mat.emissiveMap, { anisotropy: 16 });
      material.needsUpdate = true;
    });
  });

  return <primitive object={model} />;
};

const SceneContents: React.FC<{
  url: string;
  autoRotate: boolean;
  speed: number;
  onError: () => void;
}> = ({ url, autoRotate, speed, onError }) => (
  <>
    {/* Studio rig: key + fill + rim + ambient; no shadow passes (nothing receives them). */}
    <ambientLight intensity={0.55} />
    <directionalLight position={[4, 8, 5]} intensity={1.35} />
    <directionalLight position={[-6, 3, -4]} intensity={0.5} />
    <directionalLight position={[0, 4, -9]} intensity={0.4} />

    <SceneBoundary key={url} onError={onError}>
      <Suspense fallback={null}>
        <Bounds fit observe margin={1.15}>
          <Model url={url} />
        </Bounds>
      </Suspense>
    </SceneBoundary>

    <OrbitControls
      makeDefault
      enableZoom
      enablePan
      enableRotate
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate}
      autoRotateSpeed={speed * 2}
      minDistance={0.05}
      maxDistance={500}
      zoomToCursor
    />

    <Preload all />
  </>
);

export const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  backgroundColor = "#f3f4f6",
  autoRotate = true,
  rotateSpeed = 1,
}) => {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const dark = isDarkColor(backgroundColor);

  // A new URL gets a clean slate even if the previous one failed.
  useEffect(() => {
    setFailed(false);
    setAttempt(0);
  }, [modelUrl]);

  const handleError = useCallback(() => setFailed(true), []);

  const handleRetry = useCallback(() => {
    useGLTF.clear(modelUrl);
    setFailed(false);
    setAttempt((a) => a + 1);
  }, [modelUrl]);

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: backgroundColor }}>
        <div className={`text-center ${dark ? "text-paper/50" : "text-black/50"}`}>
          <SearchIcon className={`w-12 h-12 mx-auto ${dark ? "text-paper/30" : "text-black/30"}`} />
          <p className="mt-2 text-xs font-bold">No model available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative"
      style={{ background: backgroundColor }}
      role="img"
      aria-label="Interactive 3D model"
    >
      {/* The canvas stays mounted across retries/model swaps — only the scene
          contents remount, preserving the expensive WebGL context. */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45, near: 0.05, far: 2000 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <SceneContents
          key={`${modelUrl}-${attempt}`}
          url={modelUrl}
          autoRotate={autoRotate}
          speed={rotateSpeed}
          onError={handleError}
        />
      </Canvas>

      {!failed && <LoadingOverlay dark={dark} />}

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-center ${dark ? "text-paper/60" : "text-black/50"}`}>
            <SearchIcon className={`w-12 h-12 mx-auto ${dark ? "text-paper/30" : "text-black/30"}`} />
            <p className="mt-2 text-xs font-bold">Error loading 3D model</p>
            <button
              onClick={handleRetry}
              className={`mt-3 px-3 py-1 text-[10px] uppercase tracking-wider font-bold border transition-colors ${
                dark
                  ? "border-paper/20 text-paper/60 hover:text-paper hover:border-paper/50"
                  : "border-black/20 text-black/50 hover:text-black hover:border-black/40"
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
