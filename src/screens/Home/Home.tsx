import React from "react";
import { Header } from "../../components/Header";
import { Link } from "react-router-dom";

export const Home = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen text-black font-inter">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16 xl:px-24">
        {/* Hero Text */}
        <div className="max-w-6xl text-center leading-[1.15] space-y-10">
          <h1 className="font-extrabold text-[clamp(2.5rem,6vw,5rem)] tracking-tight">
            This site is dedicated to reimagining a way to experience our culture,
            where historic{" "}
            <HeroLink
              to="/case-studies/artifacts"
              label="artifacts"
              img="/images/home_about/artifact.jpg"
            />{" "}
            are brought closer than ever. Walk through digital{" "}
            <HeroLink
              to="/case-studies/museums"
              label="museum spaces"
              img="/images/home_about/museum.jpg"
            />
            , browse engaging{" "}
            <HeroLink
              to="/case-studies"
              label="exhibitions"
              img="/images/home_about/exhibition.jpg"
            />{" "}
            and see the craft behind our{" "}
            <HeroLink
              to="/reconstruction"
              label="restoration"
              img="/images/about.jpg"
            />{" "}
            that keeps our history alive.
          </h1>
        </div>

        {/* Hero Image */}
        <div className="w-full mt-20 relative">
          <img
            src="/images/home.jpg"
            alt="Home"
            className="w-full h-[55vh] lg:h-[70vh] object-cover object-center"
          />
          <div className="absolute bottom-0 left-0 w-full h-[4px]" style={{ backgroundColor: "#E33C30" }} />
        </div>
      </section>
    </div>
  );
};

// Inline image-link component with bold color accents
const HeroLink = ({
  to,
  label,
  img,
}: {
  to: string;
  label: string;
  img: string;
}) => (
  <Link
    to={to}
    className="inline-flex items-center ml-3 font-semibold text-[#E33C30] transition-colors duration-300"
  >
    <span>{label}</span>
    <img
      src={img}
      alt={label}
      className="inline-block h-[1em] w-auto max-h-[80px] object-cover ml-2"
    />
  </Link>
);
