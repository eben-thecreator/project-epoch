import React from "react";
import { ModelViewer } from "./ModelViewer";

export const ModelTest: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <h1 className="absolute top-4 left-4 z-50 text-white bg-black p-2 rounded">
        Model Loading Test
      </h1>
      <ModelViewer 
        modelUrl="/models/museumModels/museum1.glb"
        backgroundColor="#fff"
      />
    </div>
  );
};