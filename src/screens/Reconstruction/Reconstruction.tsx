import { useState } from "react";
import { Header } from "../../components/Header";
import { ModelViewer } from "../../components/ModelViewer";

interface PipelineStage {
  step: string;
  title: string;
  description: string;
  tools: string[];
}

const PIPELINE: PipelineStage[] = [
  {
    step: "01",
    title: "Field Capture",
    description:
      "Heritage assets are documented in situ with photogrammetry and GNSS survey. Hundreds of overlapping photographs and precise GPS positions are captured per object or site.",
    tools: ["Photogrammetry", "GNSS / RTK", "Total Station"],
  },
  {
    step: "02",
    title: "Processing",
    description:
      "Structure-from-motion software aligns the imagery into a dense point cloud, which is meshed, textured, and georeferenced against the surveyed control points.",
    tools: ["SfM / MVS", "Mesh Reconstruction", "Georeferencing"],
  },
  {
    step: "03",
    title: "Digital Modelling",
    description:
      "The processed model is cleaned, decimated for the web, and prepared as a glTF asset — the same geometry that powers the interactive viewer below.",
    tools: ["Retopology", "glTF / Draco", "WebGL"],
  },
  {
    step: "04",
    title: "Conservation Insight",
    description:
      "Dimensional analysis of the digital twin supports condition monitoring, virtual reconstruction of missing elements, and fabrication of physical replicas.",
    tools: ["Condition Mapping", "Digital Twin", "3D Printing"],
  },
];

const MODELS = [
  { label: "Artifact Scan", url: "/models/a101.glb" },
  { label: "Museum Space", url: "/models/museumModels/museum1.glb" },
];

export const Reconstruction = (): JSX.Element => {
  const [activeModel, setActiveModel] = useState(MODELS[0].url);

  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <main className="pt-20 pb-16">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E4002B] mb-2">
            Reconstruction & Technical Insights
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            From Field Survey to Digital Twin
          </h1>
          <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl">
            Every heritage asset in this platform begins life as a real-world object at risk.
            This is the pipeline we use to carry it into the digital realm — and back again,
            through conservation insight and physical reconstruction.
          </p>
        </section>

        {/* Pipeline */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PIPELINE.map((stage) => (
              <article
                key={stage.step}
                className="rounded-xl border border-black/10 p-6 hover:border-black/20 transition-colors"
              >
                <span className="text-[28px] font-black text-black/10 leading-none">{stage.step}</span>
                <h2 className="text-lg font-bold text-black mt-2">{stage.title}</h2>
                <p className="text-sm text-gray-700 leading-relaxed mt-2">{stage.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {stage.tools.map((tool) => (
                    <span
                      key={tool}
                      className="text-[9px] uppercase font-mono tracking-wider px-2 py-1 bg-black/[0.04] text-gray-600"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Live viewer */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E4002B] mb-1">
                Interactive Result
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-black">Explore a Reconstruction</h2>
            </div>
            <div className="flex gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.url}
                  onClick={() => setActiveModel(m.url)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
                    activeModel === m.url
                      ? "bg-[#E4002B] text-white"
                      : "bg-black/[0.05] text-gray-700 hover:bg-black/10"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-black/10">
            <ModelViewer modelUrl={activeModel} backgroundColor="#f8f9fa" />
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed max-w-2xl">
            Drag to orbit, scroll to zoom. These meshes are delivered as compressed glTF assets,
            the same format served by the platform's asset API for every digitised item.
          </p>
        </section>

        {/* Why it matters */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="rounded-xl bg-[#111] text-white p-8 sm:p-10">
            <h2 className="text-xl font-bold">Why digital reconstruction matters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-white/40">Preserve</p>
                <p className="text-sm text-white/70 mt-1.5 leading-relaxed">
                  A millimetre-accurate record survives even if the original cannot — fire, flood,
                  erosion, or theft.
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-white/40">Study</p>
                <p className="text-sm text-white/70 mt-1.5 leading-relaxed">
                  Researchers can measure, section, and compare assets anywhere in the world without
                  handling fragile originals.
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-white/40">Restore</p>
                <p className="text-sm text-white/70 mt-1.5 leading-relaxed">
                  Lost fragments can be re-fabricated from the digital twin, guiding conservators
                  with exact geometry.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
