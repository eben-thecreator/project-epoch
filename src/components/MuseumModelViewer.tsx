import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, PerspectiveCamera, Sky } from "@react-three/drei";
import * as THREE from "three";

interface MuseumModelViewerProps {
  modelUrl: string;
  backgroundColor?: string;
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

const MuseumModel: React.FC<{ modelUrl: string }> = ({ modelUrl }) => {
  const { scene } = useGLTF(modelUrl);
  const modelRef = useRef<THREE.Object3D>(null);

  // Clone the scene to avoid modifying the original
  const model = React.useMemo(() => scene.clone(true), [scene]);

  // Enhance materials
  React.useMemo(() => {
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
  }, [model]);

  return <primitive object={model} ref={modelRef} />;
};

const KeyboardControls: React.FC = () => {
  const { camera } = useThree();
  const moveSpeed = 0.1;
  const shiftSpeed = 0.2;
  
  const keys = useRef<{[key: string]: boolean}>({});
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useFrame(() => {
    velocity.current.set(0, 0, 0);
    
    // Reset direction
    direction.current.set(0, 0, 0);
    
    // Check key states and update direction
    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;
    
    // Normalize direction for diagonal movement
    if (direction.current.length() > 0) {
      direction.current.normalize();
    }
    
    // Apply speed multiplier for shift key
    const speed = keys.current.shift ? shiftSpeed : moveSpeed;
    
    // Convert direction to camera space
    direction.current.applyQuaternion(camera.quaternion);
    direction.current.multiplyScalar(speed);
    
    // Apply movement
    velocity.current.copy(direction.current);
    camera.position.add(velocity.current);
  });
  
  return null;
};

const CameraController: React.FC = () => {
  const controlsRef = useRef<any>(null);
  
  // Set up initial camera position for museum walkthrough
  useFrame(() => {
    if (controlsRef.current) {
      // Configure controls for walkthrough experience
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
      controlsRef.current.screenSpacePanning = false;
      controlsRef.current.minDistance = 0.1;
      controlsRef.current.maxDistance = 2000;
      controlsRef.current.maxPolarAngle = Math.PI;
      controlsRef.current.autoRotate = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      zoomSpeed={0.8}
      panSpeed={0.6}
      rotateSpeed={0.5}
    />
  );
};

export const MuseumModelViewer: React.FC<MuseumModelViewerProps> = ({ 
  modelUrl, 
  backgroundColor = "#f3f4f6"
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
          gl={{ antialias: true, alpha: true }}
          shadows
          key={modelKey}
        >
          <ambientLight intensity={0.3} />
          
          <Environment preset="apartment" background={false} />
          
          {/* Main directional light (sun) */}
          <directionalLight
            castShadow
            position={[10, 20, 10]}
            intensity={1}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          
          {/* Fill light to reduce harsh shadows */}
          <directionalLight
            position={[-10, 5, -5]}
            intensity={0.5}
          />
          
          {/* Back light for depth */}
          <directionalLight
            position={[0, 5, -15]}
            intensity={0.4}
          />
          
          {/* Ceiling lights for interior illumination */}
          <pointLight
            position={[0, 8, 0]}
            intensity={0.8}
            distance={20}
            decay={2}
          />
          
          <pointLight
            position={[-5, 8, 5]}
            intensity={0.6}
            distance={15}
            decay={2}
          />
          
          <pointLight
            position={[5, 8, -5]}
            intensity={0.6}
            distance={15}
            decay={2}
          />
          
          {/* Accent lights for specific areas */}
          <spotLight
            position={[0, 10, 0]}
            intensity={0.7}
            angle={0.5}
            penumbra={0.5}
            castShadow
          />
          
          <spotLight
            position={[-8, 6, 8]}
            intensity={0.5}
            angle={0.4}
            penumbra={0.3}
          />
          
          <spotLight
            position={[8, 6, -8]}
            intensity={0.5}
            angle={0.4}
            penumbra={0.3}
          />

          <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={75} />
          
          <CameraController />
          <KeyboardControls />
          
          <React.Suspense fallback={<div className="text-center w-full h-full flex items-center justify-center">Loading model...</div>}>
            <MuseumModel modelUrl={modelUrl} />
          </React.Suspense>
        </Canvas>
      </ModelErrorBoundary>
      
      <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm p-2 rounded z-50">
        <p>Controls: WASD to move | Mouse to look around | Shift for speed boost</p>
      </div>
    </div>
  );
};