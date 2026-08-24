import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/Header";
import { SiteFooter } from "../../components/SiteFooter";
import { Reveal } from "../../components/Reveal";
import { SectionLabel } from "../../components/editorial";
import { ModelViewer } from "../../components/ModelViewer";
import { cn } from "../../lib/utils";

interface PipelineStage {
  step: string;
  title: string;
  description: string;
  tools: string[];
}

interface Instrument {
  name: string;
  role: string;
}

const INSTRUMENTS: Instrument[] = [
  {
    name: "LiDAR Scanners",
    role: "Time-of-flight sweeps that resolve complex geometry as dense point sets.",
  },
  {
    name: "Cameras",
    role: "Overlapping photogrammetry frames carrying true colour and texture.",
  },
  {
    name: "GNSS Receivers",
    role: "RTK-corrected satellite positions anchoring every capture to real coordinates.",
  },
  {
    name: "Metadata Logs",
    role: "Site, date, operator, instrument and conditions recorded beside every frame.",
  },
];

const PIPELINE: PipelineStage[] = [
  {
    step: "01",
    title: "Field Capture",
    description:
      "Documentation happens in situ. Each asset is swept by LiDAR scanner or photographed as a dense, overlapping camera set — whichever the surface demands. GNSS receivers fix every station to real-world coordinates while metadata is logged alongside each frame.",
    tools: ["LiDAR / Photogrammetry", "GNSS / RTK", "Field Metadata"],
  },
  {
    step: "02",
    title: "Return to Workshop",
    description:
      "Back from the field, the raw datasets travel with the crew. Scan files, image sets, rover logs and field sheets are offloaded to workshop storage, backed up, and checked against one another before anything is processed.",
    tools: ["Data Offload", "Backup", "Integrity Check"],
  },
  {
    step: "03",
    title: "Processing",
    description:
      "In the workshop, collected data becomes geometry. Scan registrations and structure-from-motion alignment build a dense point cloud, which is meshed, textured and georeferenced against the surveyed GNSS control points.",
    tools: ["Registration / SfM", "Mesh & Texture", "Georeferencing"],
  },
  {
    step: "04",
    title: "Digital Modelling",
    description:
      "The verified model is cleaned and decimated for the web, then exported as compressed glTF — the same geometry that powers the interactive viewer below and the asset API behind the catalogue.",
    tools: ["Retopology", "glTF / Draco", "WebGL"],
  },
  {
    step: "05",
    title: "Archive & Insight",
    description:
      "Finished digital twins are published into SCHIS, where they can be explored on the atlas, measured for condition monitoring, and used to re-fabricate physical fragments where originals have been lost.",
    tools: ["Digital Twin", "Condition Mapping", "3D Printing"],
  },
];

const MODELS = [
  { label: "Artifact scan", url: "/models/a101.glb" },
  { label: "Museum space", url: "/models/museumModels/museum1.glb" },
];

export const Reconstruction = (): JSX.Element => {
  const [activeModel, setActiveModel] = useState(MODELS[0].url);

  useEffect(() => {
    document.title = `Reconstruction — Project Work`;
  }, []);

  return (
    <div className="bg-paper min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-[calc(var(--header-h)+40px)] md:pt-[calc(var(--header-h)+48px)] pb-24 md:pb-32">
        <div className="shell">
          {/* Masthead */}
          <Reveal>
            <div className="flex flex-col md:flex-row md:justify-between gap-x-10">
              <div className="md:w-3/5">
                <SectionLabel>Reconstruction Lab</SectionLabel>
                <h1 className="mt-4 f-heading-1 text-ink">
                  From field survey to{" "}
                  <em className="italic">digital twin</em>
                </h1>
              </div>
              <p className="mt-6 md:mt-2 md:w-1/3 f-body-2 text-ink-soft leading-relaxed">
                Every heritage asset in this platform begins life as a
                real-world object at risk. We capture it with LiDAR scanners
                or cameras, fix it in space with GNSS, describe it with
                metadata — then carry it cleanly, stage by stage, into the
                archive.
              </p>
            </div>
          </Reveal>

          {/* Capture instruments */}
          <Reveal delay={0.05}>
            <section aria-label="Capture instruments" className="mt-14 md:mt-20">
              <SectionLabel>What we capture with</SectionLabel>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-hairline">
                {INSTRUMENTS.map((instrument) => (
                  <div
                    key={instrument.name}
                    className="pt-5 pb-8 sm:pr-8 border-b border-hairline"
                  >
                    <p className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink">
                      <span
                        className="w-[5px] h-[5px] rounded-full bg-brand shrink-0"
                        aria-hidden="true"
                      />
                      {instrument.name}
                    </p>
                    <p className="mt-2.5 f-body-2 text-ink-soft leading-relaxed max-w-[30ch]">
                      {instrument.role}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Pipeline */}
          <section aria-label="Pipeline stages" className="mt-16 md:mt-24">
            <div className="border-t border-hairline" />
            {PIPELINE.map((stage, i) => (
              <Reveal key={stage.step} delay={Math.min(i * 0.04, 0.16)}>
                <article className="group grid grid-cols-12 gap-x-6 lg:gap-x-8 gap-y-3 items-baseline py-9 md:py-11 border-b border-hairline">
                  <span className="col-span-2 md:col-span-1 font-mono text-[11px] tracking-[0.18em] tabular-nums text-ink-soft group-hover:text-brand transition-colors duration-300">
                    {stage.step}
                  </span>
                  <div className="col-span-10 md:col-span-7">
                    <h2 className="f-heading-5 text-ink">{stage.title}</h2>
                    <p className="mt-2.5 f-body-2 leading-relaxed text-ink-soft max-w-xl">
                      {stage.description}
                    </p>
                  </div>
                  <ul className="col-span-12 md:col-span-4 md:text-right space-y-1.5 pt-1 md:pt-0">
                    {stage.tools.map((tool) => (
                      <li
                        key={tool}
                        className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </section>

          {/* Interactive result */}
          <section aria-label="Interactive result" className="mt-20 md:mt-28">
            <Reveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-x-8 gap-y-4">
                <div>
                  <SectionLabel>Interactive result</SectionLabel>
                  <h2 className="mt-3 f-heading-3 text-ink">
                    Explore a reconstruction
                  </h2>
                </div>
                <div className="flex items-center gap-5" role="tablist" aria-label="Choose model">
                  {MODELS.map((m) => (
                    <button
                      key={m.url}
                      onClick={() => setActiveModel(m.url)}
                      aria-pressed={activeModel === m.url}
                      className={`relative flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] pb-1 transition-colors duration-200 ${
                        activeModel === m.url ? "text-ink" : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      <span
                        className={cn(
                          "w-[4px] h-[4px] rounded-full bg-brand transition-opacity",
                          activeModel === m.url ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden="true"
                      />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="relative mt-8 aspect-video lg:aspect-[21/10] bg-ground-deep overflow-hidden">
                <ModelViewer modelUrl={activeModel} backgroundColor="#F5F5F5" />
                <p className="absolute bottom-4 left-4 pointer-events-none font-mono text-[8px] uppercase tracking-[0.22em] text-ink-soft">
                  Drag to orbit · scroll to zoom
                </p>
              </div>
              <div className="mt-4 flex flex-col md:flex-row justify-between gap-2">
                <p className="f-caption text-ink-soft max-w-xl leading-relaxed">
                  These meshes are delivered as compressed glTF assets — the
                  same format served by the asset API for every digitised item
                  in the catalogue.
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-soft shrink-0">
                  ( Stage 04 output )
                </p>
              </div>
            </Reveal>
          </section>

          {/* Why it matters */}
          <Reveal className="mt-20 md:mt-28 block">
            <section className="bg-ink text-paper p-8 sm:p-12 lg:p-14">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-paper/10">
                <h2 className="f-heading-3 max-w-md">
                  Why digital reconstruction matters
                </h2>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/40 shrink-0">
                  ( The point of the pipeline )
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-x-10 gap-y-8 mt-10">
                {[
                  {
                    label: "Preserve",
                    text: "A millimetre-accurate record survives even if the original cannot — fire, flood, erosion, or theft.",
                  },
                  {
                    label: "Study",
                    text: "Researchers measure, section and compare assets anywhere in the world without handling fragile originals.",
                  },
                  {
                    label: "Restore",
                    text: "Lost fragments can be re-fabricated from the digital twin, guiding conservators with exact geometry.",
                  },
                ].map((col, i) => (
                  <div
                    key={col.label}
                    className="sm:border-l sm:border-paper/12 sm:pl-6 first:sm:pl-0 first:sm:border-l-0"
                  >
                    <p className="font-display italic font-light text-[17px] text-paper/90">
                      {i + 1}. {col.label}
                    </p>
                    <p className="mt-2 f-caption text-paper/60 leading-relaxed">
                      {col.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Continue */}
          <Reveal className="mt-16 md:mt-24 block">
            <div className="flex flex-row flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-6">
              <Link
                to="/case-studies"
                className="f-body-2 text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                Browse the catalogue ↗
              </Link>
              <Link
                to="/map"
                className="f-body-2 text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                Open the atlas ↗
              </Link>
              <Link
                to="/research"
                className="f-body-2 text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                Read the research ↗
              </Link>
            </div>
          </Reveal>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};
