import { Header } from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiUrl } from "../../lib/api";
import { motion } from "framer-motion";

export const CaseStudies = (): JSX.Element => {
  const navigate = useNavigate();
  const [, setCatalogueSummary] = useState<any>({
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
      aspectRatio: "aspect-square",
      flexGrow: 1,
      details: [
        { label: "Royal", value: "28 Items" },
        { label: "Cultural", value: "19 Artifacts" },
        { label: "Religious", value: "27 Available" }
      ]
    },
    {
      id: "museums",
      title: "Heritage Sites / Monuments",
      image: "/images/core/museum.jpg",
      route: "/case-studies/museums",
      aspectRatio: "aspect-[4/3]",
      flexGrow: 1.333,
      details: [
        { label: "Heritage Sites", value: "4 Collections" },
        { label: "Monuments", value: "32 Items" },
        { label: "Specialized Museums", value: "2" },
        { label: "Traditional", value: "14 Sites" }
      ]
    },
    {
      id: "textiles",
      title: "Materials / Textiles",
      image: "/images/core/textile.jpg",
      route: "/case-studies/textiles",
      aspectRatio: "aspect-square",
      flexGrow: 1,
      details: [
        { label: "Documentation", value: "32" },
        { label: "Synthetic", value: "51" },
        { label: "Cloth & Spunned Materials", value: "05 Documented" }
      ]
    },
    {
      id: "documents",
      title: "Document Archive / Photography",
      image: "/images/core/documents.jpg",
      route: "/case-studies/documents",
      aspectRatio: "aspect-square",
      flexGrow: 1,
      details: [
        { label: "Historical", value: "18 Documents" },
        { label: "Photographic Archives", value: "10 Texts" },
        { label: "Unindexed", value: "17 Records" },
        { label: "Cultural", value: "25 Scanned" }
      ]
    },
  ];

  const sidebarStats = [
    { label: "Heritage Assets", count: 92 },
    { label: "3d Models", count: 82 },
    { label: "Locations Mapped", count: 85 },
    { label: "Collections", count: 18 },
  ];

  // Framer Motion Variants
  const pageContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const statItemVariants = {
    hidden: { opacity: 0, x: -14 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 }
    }
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 18
      }
    }
  };

  return (
    <div className="bg-white w-full h-screen overflow-hidden relative flex flex-col">
      <Header />

      <motion.main
        variants={pageContainerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 pt-32 md:pt-36 px-4 sm:px-6 lg:px-8 pb-6 flex flex-col justify-start overflow-hidden"
      >
        {/* Stats at top-left — plain text, no interaction */}
        <motion.div className="mb-10 shrink-0" variants={pageContainerVariants}>
          <div className="flex flex-col space-y-0.5">
            {sidebarStats.map((stat, index) => (
              <motion.p
                key={index}
                variants={statItemVariants}
                className="text-[13px] font-bold text-black"
              >
                {stat.label}
                <span className="text-[#a0a0a0] font-normal ml-1.5">({stat.count})</span>
              </motion.p>
            ))}
          </div>
        </motion.div>

        {/* Collection Cards Row */}
        <motion.div 
          className="flex-1 min-h-0 flex flex-row items-stretch justify-between gap-4 w-full select-none pb-4"
          variants={pageContainerVariants}
        >
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              variants={cardItemVariants}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="cursor-pointer group flex flex-col h-full min-w-0"
              style={{ flex: `${collection.flexGrow} 1 0%` }}
              onClick={() => navigate(collection.route)}
            >
              {/* Image Container */}
              <div className={`relative ${collection.aspectRatio} w-full flex-1 min-h-0 overflow-hidden mb-1.5 bg-gray-100 outline outline-2 outline-transparent group-hover:outline-[#E4002B] group-hover:outline-offset-4 transition-all duration-500 ease-out`}>
                <motion.img
                  initial={{ scale: 1.08, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>

              {/* Title */}
              <h3 className="text-[13px] font-bold text-black mb-2 transition-colors duration-300 group-hover:text-[#E4002B] shrink-0">
                {collection.title}
              </h3>

              {/* Details List */}
              <div className="space-y-0.5 w-full text-[10px] tracking-tight leading-normal shrink-0">
                {collection.details.map((detail, index) => (
                  <div key={index} className="flex justify-between w-full text-black py-0.5 border-b border-black/5 last:border-b-0">
                    <span className="text-[#555555] font-normal pr-2 truncate group-hover:text-black transition-colors duration-300">{detail.label}</span>
                    <span className="font-normal text-right shrink-0 group-hover:text-[#E4002B] transition-colors duration-300">{detail.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.main>
    </div>
  );
};
