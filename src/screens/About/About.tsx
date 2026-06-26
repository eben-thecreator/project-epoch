import React from "react";
import { Header } from "../../components/Header";
import { Card, CardContent } from "../../components/ui/card";

export const About = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-12 pt-20">
        <section className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight">
                Cultural Heritage Preservation Through Digital Innovation
              </h1>
              <p className="font-bold text-black text-lg sm:text-xl lg:text-2xl xl:text-[32px] leading-relaxed lg:leading-normal">
                We empower museums and cultural institutions with cutting-edge technology to preserve and share their invaluable collections with the world.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <img 
                  src="/images/about/hero.jpg" 
                  alt="Museum interior with digital displays" 
                  className="rounded-lg w-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-black">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our platform bridges the gap between cultural preservation and technological innovation. 
                  By digitizing artifacts and creating immersive virtual experiences, we ensure that 
                  cultural heritage remains accessible to current and future generations.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Through high-fidelity 3D scanning, virtual reality experiences, and interactive 
                  exhibitions, we're revolutionizing how people engage with history and culture.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black">Technology & Innovation</h2>
              <p className="text-gray-700 leading-relaxed">
                Leveraging state-of-the-art 3D scanning technology, photogrammetry, and virtual 
                reality, we create detailed digital replicas of artifacts and historical sites. 
                Our platform serves as a comprehensive archive and exhibition space, allowing 
                researchers and enthusiasts to explore cultural treasures in unprecedented detail.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-gray-200 rounded-lg p-6">
                <CardContent className="p-0 space-y-2">
                  <h3 className="text-lg font-bold text-black">Preservation</h3>
                  <p className="text-gray-700">
                    Digitally archiving cultural artifacts to protect them from deterioration and loss.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 rounded-lg p-6">
                <CardContent className="p-0 space-y-2">
                  <h3 className="text-lg font-bold text-black">Accessibility</h3>
                  <p className="text-gray-700">
                    Making cultural heritage accessible to global audiences through virtual exhibitions.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 rounded-lg p-6">
                <CardContent className="p-0 space-y-2">
                  <h3 className="text-lg font-bold text-black">Education</h3>
                  <p className="text-gray-700">
                    Providing immersive educational experiences that bring history and culture to life.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};