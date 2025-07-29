import React from "react";
import { Header } from "../../components/Header";

export const Research = (): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Research Page</h1>
        <p className="mb-4">This is the Research page content.</p>
      </main>
    </div>
  );
};