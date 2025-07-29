import React from "react";
import { Header } from "../../components/Header";

export const News = (): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">News Page</h1>
        <p className="mb-4">This is the News page content.</p>
      </main>
    </div>
  );
};