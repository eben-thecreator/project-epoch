import React from "react";
import { Header } from "../../components/Header";

export const Gallery = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      {/* Main content */}
      <main className="px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <h1 className="text-3xl font-bold mb-6">Gallery Page</h1>
        <p className="mb-4">This is the Gallery page content.</p>
      </main>
    </div>
  );
};