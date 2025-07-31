import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Header } from "../../components/Header";

export const About = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      {/* Main content area */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        <main className="flex-grow flex flex-col justify-center space-y-4 lg:space-y-4">

          {/* Main description */}
          <p className="font-inter font-bold text-black text-lg sm:text-xl lg:text-2xl xl:text-[32px] leading-relaxed lg:leading-normal">
            We're a small team of geomatic engineers working to preserve culture through digital tools. Over time we've shifted our focus toward heritage capturing stories that matter to ghanaian communities.
          </p>

          {/* Image with text overlay at the bottom */}
          <Card className="w-full border-none shadow-none">
            <CardContent className="p-0">
              <div className="relative">
                <img 
                  src="/images/about.jpg" 
                  alt="About" 
                  className="w-full max-h-[60vh] aspect-video lg:aspect-[1826/693] bg-[#c4c4c4] object-cover"
                />
                {/* Final paragraph positioned at the bottom of the image */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                  <p className="font-inter font-bold text-black text-lg sm:text-xl lg:text-2xl xl:text-[32px] leading-relaxed lg:leading-normal">
                    This site is an open interactive space to explore cultural artifacts in 3D and learn from our process, from fieldwork to publishing. It is designed to be straight-forward and transparent for curious minds.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Adding gap below the image */}
          <div className="h-8 lg:h-12"></div>
        </main>
      </div>
    </div>
  );
};