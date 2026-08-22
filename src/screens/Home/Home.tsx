import { Link } from "react-router-dom";
import { Header } from "../../components/Header";
import { RollingBanner } from "../../components/RollingBanner";
import { apiUrl } from "../../lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const Home = (): JSX.Element => {
  const [catalogueSummary, setCatalogueSummary] = useState<any>({
    artifacts: 0,
    museums: 0,
    textiles: 0,
    documents: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryResponse = await fetch(apiUrl("/api/catalogue/summary"));
        const summaryData = await summaryResponse.json();
        setCatalogueSummary(summaryData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const collections = [
    {
      id: "artifacts",
      title: "Objects / Artefacts",
      image: "/images/core/objects.jpg",
      route: "/case-studies/artifacts",
    },
    {
      id: "museums",
      title: "Heritage Sites",
      image: "/images/core/museum.jpg",
      route: "/case-studies/museums",
    },
    {
      id: "textiles",
      title: "Materials / Textiles",
      image: "/images/core/textile.jpg",
      route: "/case-studies/textiles",
    },
    {
      id: "documents",
      title: "Document Archive / Photography",
      image: "/images/core/documents.jpg",
      route: "/case-studies/documents",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    }
  };

  return (
    <div className="bg-white w-full min-h-screen relative flex flex-col">
      <Header />

      {/* Hero Section — full viewport */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background image */}
        <img
          src="/images/home.jpg"
          alt="SCHIS Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Research Team — left aligned, vertically centered */}
        <motion.div 
          className="absolute inset-0 flex items-center"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="px-6 sm:px-12 lg:px-20 max-w-2xl z-10">
            <p className="text-white text-[13px] md:text-[15px] font-medium uppercase text-left drop-shadow-lg">
              Research Team: Amoah-Yeboah Abena Pokua &bull; Ankudey Ebenezer &bull; Elorm Dei-Zanga Aku
            </p>
            <p className="text-white/70 text-[13px] md:text-[13px] mt-2 font-medium uppercase text-left drop-shadow-lg">
              Academic Supervisor: Professor Quaye Ballard
            </p>
          </div>
        </motion.div>

        {/* Digital Museum Card — bottom right */}
        <motion.div 
          className="absolute bottom-20 right-4 sm:right-6 lg:right-8 z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Link to="/case-studies/museums" className="block group">
            <div className="flex items-start gap-2.5 bg-white p-2.5 pr-4 shadow-lg max-w-[340px] sm:max-w-[380px]">
              <img
                src="/images/core/museum.jpg"
                alt="Digital Museum"
                className="w-[80px] h-[80px] object-cover shrink-0"
              />
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-[14px] sm:text-[15px] font-bold text-black leading-tight mb-1">
                  Digital Museum
                </h3>
                <p className="text-[10px] sm:text-[11px] text-gray-500 leading-snug mb-1.5">
                  Explore Ghana's cultural heritage through immersive 3D artifacts.
                </p>
              </div>
              <div className="shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all duration-300"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Rolling Banner — at the base of the hero */}
        <div className="absolute bottom-0 left-0 w-full z-10">
          <RollingBanner pinned />
        </div>
      </section>

      {/* Collection Section */}
      <motion.section 
        className="w-full bg-white py-12 md:py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Centered header */}
        <motion.div className="flex flex-col items-center text-center mb-10" variants={itemVariants}>
          <h2 className="text-[18px] md:text-[22px] uppercase font-bold text-black">
            Collection
          </h2>
          <p className="text-[12px] md:text-[13px] text-black mt-3 max-w-lg leading-relaxed">
            Explore a curated collection of documented heritage assets, including artefacts, monuments, textiles, and archival records that preserve the cultural identity and history of Ghana.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 w-full">
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              variants={itemVariants}
               className={`group flex flex-col cursor-pointer ${
                collection.id === "museums" ? "col-span-2" : ""
              }`}
            >
              <Link to={collection.route} className="flex flex-col">
                <div className={`relative w-full overflow-hidden bg-black/5 h-[220px] md:h-[300px] ${
                  collection.id === "museums" ? "" : "aspect-[3/4]"
                }`}>
                    <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out"
                  />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />
                   <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                     <span className="block text-white text-5xl md:text-6xl font-bold leading-none">{catalogueSummary[collection.id]}</span>
                     <div className="w-8 h-[1px] bg-white/40 mt-3 mb-2" />
                     <span className="block text-white text-[16px]">Items</span>
                  </div>
                </div>
                <h3 className="text-[13px] md:text-[15px] uppercase font-bold text-black mt-3 group-hover:text-gray-600 transition-colors duration-300">
                  {collection.title}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
