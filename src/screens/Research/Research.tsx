import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/Header";
import { SiteFooter } from "../../components/SiteFooter";
import { Reveal } from "../../components/Reveal";
import { MetaList, MetaRow, SectionLabel } from "../../components/editorial";

interface ResearchPaper {
  title: string;
  authors: string;
  journal: string;
  year: number;
  abstract: string;
  tags: string[];
}

const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    title:
      "High-Fidelity 3D Reconstruction of West African Pottery using Low-Cost Photogrammetry",
    authors: "Amoah-Yeboah Abena Pokua",
    journal: "Journal of Cultural Heritage Digitalization",
    year: 2025,
    abstract:
      "This study explores cost-effective methodologies for capturing and preserving historical pottery artifacts. By utilizing standard consumer-grade cameras and open-source photogrammetry pipelines, we demonstrate high-accuracy 3D asset generation comparable to industrial laser scanning.",
    tags: ["3D Reconstruction", "Photogrammetry", "West African Pottery"],
  },
  {
    title:
      "Spatial Cultural Heritage Systems: Bridging Geographic Information Systems with Digital Humanities",
    authors: "Ankudey Ebenezer",
    journal: "International Transactions on Spatial Humanities",
    year: 2026,
    abstract:
      "Traditionally, archival records are stored as isolated textual items. This paper proposes a unified spatial information framework (SCHIS) that grounds historical documents, artifacts, and multimedia narratives within their precise geographic coordinates, enabling spatial queries and interactive map exploration.",
    tags: ["GIS", "Spatial Systems", "Digital Archives"],
  },
  {
    title: "Preserving Indigenous Narrative through Interactive 3D Environments",
    authors: "Elorm Dei-Zanga Aku",
    journal: "Virtual Heritage & Narrative Technologies",
    year: 2026,
    abstract:
      "How can 3D environments preserve intangible oral histories? This paper presents a case study of virtual walk-throughs in digitized historic sites, integrating spatial audio and contextual annotations to create emotional resonance and historical accuracy.",
    tags: ["Immersive Tech", "Oral History", "Virtual Museum"],
  },
];

export const Research = (): JSX.Element => {
  useEffect(() => {
    document.title = `Research — Project Work`;
  }, []);

  return (
    <div className="bg-paper min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-[calc(var(--header-h)+40px)] md:pt-[calc(var(--header-h)+48px)] pb-24 md:pb-32">
        <div className="shell">
          {/* Masthead — h1 left, live counts right */}
          <Reveal>
            <div className="flex flex-col md:flex-row md:justify-between gap-x-10">
              <h1 className="f-heading-1 text-ink">Research</h1>
              <div className="mt-6 md:mt-0 md:w-1/2 lg:pr-12">
                <p className="f-body-1 text-ink">
                  Published works{" "}
                  <span className="text-ink-soft">
                    ({RESEARCH_PAPERS.length})
                  </span>
                </p>
                <p className="mt-3 f-body-2 text-ink-soft leading-relaxed max-w-md">
                  The academic foundations of SCHIS — capture methodology,
                  spatial theory and the craft of digital preservation.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Papers index */}
          <section aria-label="Published papers" className="mt-14 md:mt-20 border-t border-hairline">
            {RESEARCH_PAPERS.map((paper, idx) => (
              <Reveal key={paper.title} delay={Math.min(idx * 0.05, 0.15)}>
                <article className="group grid grid-cols-12 gap-x-6 lg:gap-x-8 gap-y-3 py-9 md:py-11 border-b border-hairline">
                  <span className="col-span-2 md:col-span-1 font-mono text-[11px] tracking-[0.18em] tabular-nums text-ink-soft group-hover:text-brand transition-colors duration-300">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="col-span-10 md:col-span-7">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-soft">
                      {paper.authors}
                    </p>
                    <h2 className="mt-2.5 f-heading-4 text-ink max-w-xl leading-snug">
                      {paper.title}
                    </h2>
                    <p className="mt-3 f-caption leading-relaxed text-ink-soft max-w-xl">
                      {paper.abstract}
                    </p>
                  </div>
                  <div className="col-span-10 col-start-3 md:col-span-4 md:col-start-auto md:text-right space-y-1.5 pt-1 md:pt-0">
                    <p className="font-mono text-[11px] tabular-nums tracking-[0.08em] text-ink">
                      {paper.year}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft leading-relaxed md:max-w-[26ch] md:inline-block">
                      {paper.journal}
                    </p>
                    <p className="pt-2 font-mono text-[8.5px] uppercase tracking-[0.16em] text-ink-soft leading-loose">
                      {paper.tags.join(" · ")}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft pt-6">
              Full texts — in press
            </p>
          </section>

          {/* Programme */}
          <Reveal className="mt-16 md:mt-24 block">
            <section aria-label="Academic partnership" className="grid lg:grid-cols-12 gap-x-8 gap-y-8 items-start">
              <div className="lg:col-span-5">
                <SectionLabel>Academic Partnership</SectionLabel>
                <h2 className="mt-4 f-heading-3 text-ink max-w-md leading-snug">
                  A geomatic engineering thesis, kept in the field
                </h2>
                <p className="mt-4 f-body-2 leading-relaxed text-ink-soft max-w-md">
                  This project is a research initiative overseen by the
                  Department of Geomatic Engineering, supervised by Professor
                  Quaye Ballard. We collaborate with national heritage boards
                  and architectural historians to create accurate spatial
                  models of Ghana's material culture.
                </p>
              </div>
              <MetaList className="lg:col-span-4 lg:col-start-9 w-full">
                <MetaRow label="Programme" value="BSc Geomatic Engineering" />
                <MetaRow label="Department" value="Geomatic Engineering" />
                <MetaRow label="Supervisor" value="Professor Quaye Ballard" />
                <MetaRow mono label="System" value="SCHIS" />
              </MetaList>
            </section>
          </Reveal>

          {/* Continue */}
          <Reveal className="mt-16 md:mt-24 block">
            <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-6">
              <Link
                to="/reconstruction"
                className="f-body-2 text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                See the pipeline in practice ↗
              </Link>
              <Link
                to="/case-studies"
                className="f-body-2 text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                Browse the catalogue ↗
              </Link>
              <Link
                to="/contact"
                className="f-body-2 text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                Request a full text ↗
              </Link>
            </div>
          </Reveal>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};
