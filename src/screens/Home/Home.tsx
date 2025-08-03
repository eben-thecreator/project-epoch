import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Header } from "../../components/Header";

export const Home = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      {/* Main content area */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col pt-32 pb-32">
        <main className="flex-grow flex flex-col justify-center space-y-8 lg:space-y-12">
          <Card className="w-full border-none shadow-none">
            <CardContent className="p-0">
              <img 
                src="/images/home.jpg" 
                alt="Home" 
                className="w-full max-h-[60vh] aspect-video lg:aspect-[1826/693] bg-[#c4c4c4] object-cover"
              />
            </CardContent>
          </Card>

          {/* Description text */}
          <div className="max-w-none">
            <p className="font-inter font-bold text-black text-lg sm:text-xl lg:text-2xl xl:text-[32px] leading-relaxed lg:leading-normal">
              This platform preserves and shares our cultural heritage through storytelling, interactive artifacts, and immersive digital experiences that connect the past with the present. This platform preserves and shares our cultural heritage through storytelling, interactive artifacts, and immersive digital experiences that connect the past with the present.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};