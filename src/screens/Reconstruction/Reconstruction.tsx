import React from "react";
import { Header } from "../../components/Header";
import { MuseumModelViewer } from "../../components/MuseumModelViewer";

export const Reconstruction: React.FC = () => {
  return (
    <div className="bg-white w-full min-h-screen">
      <Header />
      <div className="w-full h-screen">
        <MuseumModelViewer 
          modelUrl="/models/museumModels/museum1.glb"
          backgroundColor="#333333"
        />
      </div>
    </div>
  );
};