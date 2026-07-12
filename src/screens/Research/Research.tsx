import { Header } from "../../components/Header";
import { Card, CardContent } from "../../components/ui/card";

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
    title: "High-Fidelity 3D Reconstruction of West African Pottery using Low-Cost Photogrammetry",
    authors: "Amoah Yeboah Abena Pokua, Academic Supervisor: Professor Quaye Ballard",
    journal: "Journal of Cultural Heritage Digitalization",
    year: 2025,
    abstract: "This study explores cost-effective methodologies for capturing and preserving historical pottery artifacts. By utilizing standard consumer-grade cameras and open-source photogrammetry pipelines, we demonstrate high-accuracy 3D asset generation comparable to industrial laser scanning.",
    tags: ["3D Reconstruction", "Photogrammetry", "West African Pottery"]
  },
  {
    title: "Spatial Cultural Heritage Systems: Bridging Geographic Information Systems with Digital Humanities",
    authors: "Ankudey Ebenezer, Academic Supervisor: Professor Quaye Ballard",
    journal: "International Transactions on Spatial Humanities",
    year: 2026,
    abstract: "Traditionally, archival records are stored as isolated textual items. This paper proposes a unified spatial information framework (SCHIS) that grounds historical documents, artifacts, and multimedia narratives within their precise geographic coordinates, enabling spatial queries and interactive map exploration.",
    tags: ["GIS", "Spatial Systems", "Digital Archives"]
  },
  {
    title: "Preserving Indigenous Narrative through Interactive 3D Environments",
    authors: "Elorm Dei-Zanga, Academic Supervisor: Professor Quaye Ballard",
    journal: "Virtual Heritage & Narrative Technologies",
    year: 2026,
    abstract: "How can 3D environments preserve intangible oral histories? This paper presents a case study of virtual walk-throughs in digitized historic sites, integrating spatial audio and contextual annotations to create emotional resonance and historical accuracy.",
    tags: ["Immersive Tech", "Oral History", "Virtual Museum"]
  }
];

export const Research = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-12 pt-20 max-w-5xl mx-auto">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight uppercase">
              Research & Publications
            </h1>
            <p className="text-gray-700 text-lg sm:text-xl max-w-3xl leading-relaxed">
              Discover the academic foundations, publications, and technical research driving the Spatial Cultural Heritage Information System (SCHIS).
            </p>
          </div>

          {/* Papers list */}
          <div className="space-y-8">
            {RESEARCH_PAPERS.map((paper, idx) => (
              <Card key={idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <CardContent className="p-0 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {paper.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-800 px-2.5 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-xl font-bold text-black leading-snug">
                    {paper.title}
                  </h2>

                  <div className="text-xs text-gray-500 font-semibold">
                    By {paper.authors} • <span className="italic">{paper.journal}</span> ({paper.year})
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {paper.abstract}
                  </p>

                  <div className="pt-2">
                    <button className="text-xs font-bold text-black border-b-2 border-black hover:border-black/50 transition-colors uppercase tracking-widest flex items-center gap-2">
                      Read Full Paper 
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Academic Info */}
          <div className="border-t border-gray-200 pt-8 space-y-4">
            <h3 className="text-lg font-bold text-black uppercase tracking-wider">Academic Partnership</h3>
            <p className="text-gray-700 text-sm leading-relaxed max-w-3xl">
              This project is part of a research initiative overseen by the Department of Geomatic Engineering, supervised by <strong>Professor Quaye Ballard</strong>. We collaborate with national heritage boards and architectural historians to create accurate spatial models.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
