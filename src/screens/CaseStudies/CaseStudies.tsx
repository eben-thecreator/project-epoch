import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiUrl } from "../../lib/api";
import { motion } from "framer-motion";
import { Header } from "../../components/Header";
import {
  CatalogueCard,
  buildCatalogueGroups,
} from "../../components/CatalogueCard";
import { catalogueCollections } from "./catalogueConfig";

interface CatalogueSummary {
  total?: number;
  artifacts?: number;
  museums?: number;
  textiles?: number;
  documents?: number;
  needs_review?: number;
}

/* The house ease, captured from the reference build CSS */
const HOUSE: [number, number, number, number] = [0.59, 0.01, 0.28, 1];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: HOUSE } },
};

type CollectionCard = {
  key: string;
  title: string;
  route: string;
  image: string;
  count: number | null;
  chips: string[];
};

export const CaseStudies = (): JSX.Element => {
  const [summary, setSummary] = useState<CatalogueSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/catalogue/summary"))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: CatalogueSummary) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        /* summary is non-critical — cards render with em-dash counts */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const countOf = (key: keyof CatalogueSummary) =>
    summary ? summary[key] ?? null : null;

  const images: Record<string, string> = {
    artifacts: "/images/core/objects.jpg",
    museums: "/images/core/museum.jpg",
    textiles: "/images/core/textile.jpg",
    documents: "/images/core/documents.jpg",
  };

  const cards: CollectionCard[] = catalogueCollections.map((collection) => ({
    key: collection.key,
    title: collection.title,
    route: collection.route,
    image: images[collection.key],
    count: countOf(collection.key),
    chips: collection.chips.slice(0, 5),
  }));

  /* The reference rhythm: featured pair (⅓ + ⅔), then a trio of thirds.
     With four collections this yields one pair group and one partial trio. */
  const groups = buildCatalogueGroups(cards);

  const stats = [
    { label: "Heritage Assets", value: countOf("total") },
    { label: "Awaiting Classification", value: countOf("needs_review") },
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      <Header />

      <main className="pb-24 pt-[calc(var(--header-h)+40px)] md:pb-32 md:pt-[calc(var(--header-h)+48px)] lg:pt-[calc(var(--header-h)+64px)]">
        {/* Title row — h1 with live counts beneath, as on the reference index */}
        <div className="shell">
          <h1 className="f-heading-1 text-ink">Catalogue</h1>
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: HOUSE }}
          >
            {stats.map((stat) => (
              <p key={stat.label} className="f-body-1 text-ink">
                {stat.label}
                <span className="text-ink-soft"> ({stat.value ?? "—"})</span>
              </p>
            ))}
          </motion.div>
        </div>

        {/* Index count line */}
        <div className="shell mt-1 md:mt-16 lg:mt-24">
          <span className="f-body-1 block text-ink-soft">
            Showing the latest{" "}
            {summary?.total != null ? summary.total : "—"} records across four
            collections
          </span>
        </div>

        {/* Collection grid */}
        <div className="shell mt-6" data-catalogue-grid>
          <h2 className="sr-only">Collections</h2>
          <motion.ul
            className="flex flex-col gap-y-12 md:gap-y-16 lg:gap-y-24"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {groups.map((group, gi) => (
              <motion.li key={gi} variants={fadeUp}>
                <ul
                  className={
                    group.kind === "pair"
                      ? "grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-3 xl:gap-x-4"
                      : "grid grid-cols-1 gap-x-3 gap-y-12 sm:grid-cols-2 md:grid-cols-3 xl:gap-x-4"
                  }
                >
                  {group.items.map((card, ci) => (
                    <li
                      key={card.key}
                      className={
                        group.kind === "pair" && ci === 1 ? "md:col-span-2" : undefined
                      }
                    >
                      <CatalogueCard
                        to={card.route}
                        title={card.title}
                        tagline={`${card.count ?? "—"} documented records`}
                        imageUrl={card.image}
                        alt={card.title}
                        wide={group.kind === "pair" && ci === 1}
                        tags={card.chips.map((chip) => ({ label: chip }))}
                      />
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Pointer to the deepest scopes, in the voice of the reference footer */}
        <div className="shell mt-16 md:mt-24">
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-6">
            {catalogueCollections.map((collection) => (
              <Link
                key={collection.key}
                to={collection.route}
                className="f-body-2 text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                {collection.shortTitle}
              </Link>
            ))}
            <Link
              to="/research"
              className="f-body-2 text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              Research
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
