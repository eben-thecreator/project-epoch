import { Link } from "react-router-dom";
import { Header } from "../../components/Header";

export const Home = (): JSX.Element => {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-white select-none">
      {/* Shared header — identical to every other page */}
      <Header />

      {/* Body: two-column split, starts behind the fixed header */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* LEFT COLUMN — museum image background + floating black card */}
        <div className="relative w-full md:w-[47%] h-[45vh] md:h-full flex-shrink-0 overflow-hidden flex flex-col items-start justify-start px-4 sm:px-6 lg:px-8 pt-20 md:pt-28">
          <img
            src="/images/home_about/virtual.jpg"
            alt="SCHIS Museum Hall Vault"
            className="absolute inset-0 w-full h-full object-cover brightness-95"
          />
          <div className="absolute inset-0 bg-black/10" />

          {/* Floating Left-Aligned Black Card */}
          <div className="relative bg-[#060606] text-white p-6 md:p-8 w-full max-w-[340px] aspect-[1.7] flex flex-col justify-between shadow-2xl z-10">
            <p className="text-[11px] md:text-[12px] leading-relaxed text-left text-white/95 font-medium">
              The Digital Museum project digitizes and preserves rich cultural heritage, making diverse archaeological and ethnographical treasures accessible globally.
            </p>

            <div className="text-left">
              <Link
                to="/case-studies/museums"
                className="inline-flex items-center gap-3 text-white font-bold uppercase tracking-widest text-[10px] hover:text-white/80 transition-colors group"
              >
                <span>Enter Digital Museum</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Research team credits */}
          <div className="absolute bottom-6 left-4 sm:left-6 lg:left-8 text-white z-10 max-w-[90%] md:max-w-[85%]">
            <p className="text-[9px] md:text-[10px] leading-relaxed text-white font-semibold tracking-wider uppercase">
              Research Team: Amoah-Yeboah Abena Pokua • Ankudey Ebenezer • Elorm Dei-Zanga Aku<br />
              Academic Supervisor: Professor Quaye Ballard
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — Main Introduction Info */}
        <div className="relative w-full md:w-[53%] h-[60vh] md:h-full bg-white flex flex-col items-center justify-start px-6 sm:px-12 lg:px-16 overflow-y-auto pt-20 md:pt-28">

          {/* Main Visual */}
          <div className="w-full max-w-[340px] aspect-[1.7] overflow-hidden mb-8 flex-shrink-0">
            <img
              src="/images/home_about/exhibition.jpg"
              alt="SCHIS Museum Exhibition View"
              className="w-full h-full object-cover transform transition-transform duration-500"
            />
          </div>

          {/* Project Introduction */}
          <p className="text-black text-[13px] md:text-sm leading-relaxed max-w-md mx-auto mb-8 font-medium text-center">
            The Spatial Cultural Heritage Information System (SCHIS) connects places, artifacts, and historical narratives into a unified interactive map, allowing users to explore heritage as something rooted in real-world locations rather than isolated records.
          </p>

          {/* Browse Database CTA */}
          <Link
            to="/case-studies"
            className="group relative bg-black text-white font-bold px-10 py-4 flex items-center justify-center overflow-hidden text-[10px] uppercase tracking-widest"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-3">
              Visit Catalogue
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="absolute right-8 w-3.5 h-3.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
};
