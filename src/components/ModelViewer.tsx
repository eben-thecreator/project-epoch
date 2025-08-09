import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, Bounds, useBounds, Environment } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  modelUrl: string;
  backgroundColor?: string;
  autoRotate?: boolean;
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
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 011.414-0.586H14l2 2v2a2 2 0 01-2 2h-4.172a2 2 0 00-1.414 0.586L4 16z" />
              <circle cx="18" cy="18" r="2" />
              <path d="M8.586 4H4a2 2 0 00-2 2v4l2.586-2.586a1 1 0 011.414 0L10 9.414l2-2a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414l5.414-5.414a2 2 0 001.414-1.414L16 8h4a2 2 0 002-2V4a2 2 0 00-2-2h-4.586a1 1 0 00-.707.293l-6 6a1 1 0 000 1.414l6 6a1 1 0 00.707.293z" />
            </svg>
            <p className="mt-2">Error loading 3D model</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const RotatingModel: React.FC<{ object: THREE.Object3D; autoRotate: boolean }> = ({ object, autoRotate }) => {
  const ref = useRef<THREE.Object3D>(object);

  useFrame(() => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += 0.005;
    }
  });

  return <primitive object={object} ref={ref} />;
};

const Model: React.FC<{ modelUrl: string; autoRotate?: boolean }> = ({ modelUrl, autoRotate = false }) => {
  const { scene } = useGLTF(modelUrl);
  const bounds = useBounds();

  const model = scene.clone(true);

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

  const groupRef = useRef<THREE.Group>(null);

  React.useLayoutEffect(() => {
    if (!groupRef.current) return;

    const bbox = new THREE.Box3().setFromObject(groupRef.current);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bbox.getSize(size);
    bbox.getCenter(center);

    groupRef.current.position.sub(center);

    const isWiderThanDeep = size.x > size.z;
    if (isWiderThanDeep) {
      groupRef.current.rotation.y = Math.PI / 2;
    }

    bounds.refresh(groupRef.current).fit();
  }, [bounds]);

  return (
    <group ref={groupRef}>
      <RotatingModel object={model} autoRotate={autoRotate} />
    </group>
  );
};

export const ModelViewer: React.FC<ModelViewerProps> = ({ 
  modelUrl, 
  backgroundColor = "#f3f4f6",
  autoRotate = false
}) => {
  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: backgroundColor }}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 011.414-0.586H14l2 2v2a2 2 0 01-2 2h-4.172a2 2 0 00-1.414 0.586L4 16z" />
            <circle cx="18" cy="18" r="2" />
            <path d="M8.586 4H4a2 2 0 00-2 2v4l2.586-2.586a1 1 0 011.414 0L10 9.414l2-2a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414l5.414-5.414a2 2 0 001.414-1.414L16 8h4a2 2 0 002-2V4a2 2 0 00-2-2h-4.586a1 1 0 00-.707.293l-6 6a1 1 0 000 1.414l6 6a1 1 0 00.707.293z" />
          </svg>
          <p className="mt-2">No model available</p>
        </div>
      </div>
    );
  }

  const modelKey = React.useMemo(() => modelUrl, [modelUrl]);

  return (
    <div className="w-full h-full relative" style={{ background: backgroundColor, zIndex: 50 }}>
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

          <Suspense fallback={<div className="text-center w-full h-full flex items-center justify-center">Loading model...</div>}>
            <Bounds fit observe margin={1}>
              <Model modelUrl={modelUrl} autoRotate={autoRotate} key={modelKey} />
            </Bounds>
          </Suspense>

          <OrbitControls
            enableZoom
            enablePan
            enableRotate
            minDistance={0.5}
            maxDistance={100}
            autoRotate={autoRotate}
            autoRotateSpeed={20}
            makeDefault
            up={[0, 1, 0]}
          />

          <Preload all />
        </Canvas>
      </ModelErrorBoundary>
    </div>
  );
};