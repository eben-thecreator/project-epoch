import { Link } from "react-router-dom";
import { Header } from "../../components/Header";
import { InstitutionLogos } from "../../components/InstitutionLogos";
import { apiUrl } from "../../lib/api";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface CatalogueSummary {
  total?: number;
  artifacts?: number;
  museums?: number;
  textiles?: number;
  documents?: number;
}

export const Home = (): JSX.Element => {
  const [catalogueSummary, setCatalogueSummary] = useState<CatalogueSummary | null>(null);
  const standfirstRef = useRef<HTMLParagraphElement>(null);
  const [standfirstOffset, setStandfirstOffset] = useState(0);

  /*
   * The Collection standfirst's left edge tracks the "Catalogue" item in
   * the fixed header nav — same grid line as the chrome above it.
   */
  useEffect(() => {
    const compute = () => {
      const cell = standfirstRef.current;
      const link = document.querySelector<HTMLElement>(
        'header nav[aria-label="Primary"] a'
      );
      if (!cell || !link) return;
      if (!window.matchMedia("(min-width: 768px)").matches) {
        setStandfirstOffset(0);
        return;
      }
      const delta =
        link.getBoundingClientRect().left - cell.getBoundingClientRect().left;
      setStandfirstOffset(Math.max(0, Math.round(delta)));
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/catalogue/summary"))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: CatalogueSummary) => {
        if (!cancelled) setCatalogueSummary(data);
      })
      .catch(() => {
        /* non-critical */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const collections = [
    {
      id: "artifacts",
      title: "Objects / Artefacts",
      detail:
        "Ceramics, metalwork and ritual objects documented in museum holdings…",
      image: "/images/core/objects.jpg",
      route: "/case-studies/artifacts",
    },
    {
      id: "museums",
      title: "Heritage Sites",
      detail:
        "Museums, forts and monuments charted across Ghana's regions…",
      image: "/images/core/museum.jpg",
      route: "/case-studies/museums",
    },
    {
      id: "textiles",
      title: "Materials / Textiles",
      detail:
        "Kente, adinkra and hand-woven cloth records with provenance notes…",
      image: "/images/core/textile.jpg",
      route: "/case-studies/textiles",
    },
    {
      id: "documents",
      title: "Document Archive / Photography",
      detail:
        "Archival photographs, manuscripts and maps scanned and georeferenced…",
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

      {/* Hero — full-viewport landing in the reference-museum pattern:
          one giant photograph, a single call to action into the virtual
          museum, institutional logos docked bottom-right. The hero itself
          is not a link. */}
      <section className="relative w-full h-screen overflow-hidden bg-black">
        <motion.img
          src="/images/home.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/65" />

        {/* Virtual museum entry — the hero's single call to action */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
          <motion.p
            className="f-caption font-sans uppercase tracking-[0.32em] text-white/70"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            Virtual Experience
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/reconstruction"
              className="group mt-6 inline-flex flex-col items-center"
            >
              <span className="f-heading-2 text-white">
                <span className="decoration-1 underline-offset-[10px] group-hover:underline">
                  Enter the Digital Museum
                </span>
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Bottom bar — research credit left, institution strip right.
            Stacked (credit above logos) until xl so the two never collide
            when the logo strip wraps. */}
        <div className="absolute inset-x-3 bottom-5 z-10 flex flex-col-reverse gap-6 sm:inset-x-4 xl:flex-row xl:flex-wrap xl:items-end xl:justify-between xl:gap-x-10 xl:gap-y-4">
          <motion.div
            className="f-caption min-w-0 max-w-[46ch] font-sans leading-relaxed tracking-[-0.005em] drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            <p className="text-white/90">
              Research By: Amoah-Yeboah Abena Pokua, Ankudey Ebenezer, Elorm
              Dei-Zanga Aku
            </p>
            <p className="mt-2 text-white/60">
              Academic Supervisor: Professor Quaye Ballard
            </p>
          </motion.div>

          <motion.div
            className="flex min-w-0 justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            <InstitutionLogos />
          </motion.div>
        </div>
      </section>

      {/* Collection index — catalogue anatomy: statement header, count line,
          then a uniform two-row card grid on the shared gutter shell */}
      <motion.section
        className="w-full bg-white py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Statement header — title left, standfirst right, as on the index pages */}
        <motion.div
          className="shell flex flex-col md:flex-row md:justify-between"
          variants={itemVariants}
        >
          <h2 className="f-heading-2 text-ink">Collection</h2>
          <p
            ref={standfirstRef}
            className="f-body-1 mt-5 max-w-[52ch] text-ink md:mt-0 md:w-1/2 lg:pr-12"
            style={
              standfirstOffset ? { paddingLeft: `${standfirstOffset}px` } : undefined
            }
          >
            A curated record of Ghana&rsquo;s documented heritage &mdash;
            artefacts, monuments, textiles and archival records &mdash; each
            georeferenced so the country&rsquo;s cultural history can be
            studied in place.
          </p>
        </motion.div>

        {/* Index count line */}
        <motion.div className="shell mt-3 md:mt-4" variants={itemVariants}>
          <span className="f-body-1 block text-ink-soft">
            Showing the latest{" "}
            {catalogueSummary?.total != null ? catalogueSummary.total : "—"}{" "}
            records across four collections
          </span>
        </motion.div>

        {/* Cards — original index grid: featured museums tile spans two
            columns, portrait wells, no hover treatment */}
        <div className="shell mt-8 md:mt-10">
          <div className="grid w-full grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
            {collections.map((collection) => (
              <motion.div
                key={collection.id}
                variants={itemVariants}
                className={collection.id === "museums" ? "lg:col-span-2" : ""}
              >
                <Link to={collection.route} className="flex flex-col">
                  <div
                    className={`relative h-[220px] w-full overflow-hidden bg-black/5 md:h-[300px] ${
                      collection.id === "museums" ? "" : "aspect-[3/4]"
                    }`}
                  >
                    <img
                      src={collection.image}
                      alt={collection.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-4 md:pr-1">
                    <h3 className="f-heading-5 text-ink">
                      {collection.title}
                    </h3>
                    <p className="f-body-1 mt-1.5 leading-relaxed text-ink-soft">
                      {collection.detail}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

