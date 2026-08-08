import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, Bounds } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  modelUrl: string;
  backgroundColor?: string;
  autoRotate?: boolean;
  rotateSpeed?: number;
}

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
      return (
        <div className="w-full h-full flex items-center justify-center bg-black/5">
          <div className="text-center text-black/50">
            <svg className="w-12 h-12 mx-auto text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-2 text-xs uppercase tracking-wider font-bold">Error loading 3D model</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const RotatingModel: React.FC<{ object: THREE.Object3D; autoRotate: boolean; speed: number }> = ({ object, autoRotate, speed }) => {
  const ref = useRef<THREE.Object3D>(object);

  useFrame(() => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += speed;
    }
  });

  return <primitive object={object} ref={ref} />;
};

const Model: React.FC<{ modelUrl: string; autoRotate?: boolean; speed?: number }> = ({ modelUrl, autoRotate = false, speed = 0.002 }) => {
  const { scene } = useGLTF(modelUrl);

  const model = React.useMemo(() => scene.clone(true), [scene]);

  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          const mat = material as THREE.Material & {
            map?: THREE.Texture;
            roughnessMap?: THREE.Texture;
            metalnessMap?: THREE.Texture;
            normalMap?: THREE.Texture;
            emissiveMap?: THREE.Texture;
          };

          if (mat.map) mat.map.anisotropy = 16;
          if (mat.roughnessMap) mat.roughnessMap.anisotropy = 16;
          if (mat.metalnessMap) mat.metalnessMap.anisotropy = 16;
          if (mat.normalMap) mat.normalMap.anisotropy = 16;
          if (mat.emissiveMap) mat.emissiveMap.anisotropy = 16;

          material.needsUpdate = true;
        });
      }
    }
  });

  return (
    <group>
      <RotatingModel object={model} autoRotate={autoRotate} speed={speed} />
    </group>
  );
};

export const ModelViewer: React.FC<ModelViewerProps> = ({ 
  modelUrl, 
  backgroundColor = "#f3f4f6",
  autoRotate = false,
  rotateSpeed = 0.002
}) => {
  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: backgroundColor }}>
        <div className="text-center text-black/50">
          <svg className="w-12 h-12 mx-auto text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="mt-2 text-xs uppercase tracking-wider font-bold">No model available</p>
        </div>
      </div>
    );
  }

  const modelKey = React.useMemo(() => modelUrl, [modelUrl]);

  return (
    <div className="w-full h-full relative" style={{ background: backgroundColor }}>
      <ModelErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50}}
          gl={{ antialias: true, alpha: true }}
          shadows
          key={modelKey}
        >
          <ambientLight intensity={0.5} />

          <directionalLight
            castShadow
            position={[5, 10, 5]}
            intensity={1.5}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          <directionalLight
            position={[-5, 5, -5]}
            intensity={1}
          />

          <directionalLight
            position={[0, -5, -5]}
            intensity={0.5}
          />

          <pointLight position={[0, 15, -15]} intensity={0.8} />

          <spotLight
            position={[0, 20, 0]}
            intensity={0.7}
            angle={0.3}
            penumbra={1}
            castShadow
          />

          <Suspense fallback={<div className="text-center w-full h-full flex items-center justify-center text-black/40 text-xs uppercase tracking-wider font-bold">Loading model...</div>}>
            <Bounds fit observe margin={1}>
              <Model modelUrl={modelUrl} autoRotate={autoRotate} speed={rotateSpeed} key={modelKey} />
            </Bounds>
          </Suspense>

          <OrbitControls
            enableZoom
            enablePan
            enableRotate
            minDistance={0.5}
            maxDistance={100}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            makeDefault
            up={[0, 1, 0]}
          />

          <Preload all />
        </Canvas>
      </ModelErrorBoundary>
    </div>
  );
};