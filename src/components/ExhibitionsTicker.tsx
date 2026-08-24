import React from "react";

interface Exhibition {
  id: string;
  title: string;
  location: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
}

const EXHIBITIONS: Exhibition[] = [
  {
    id: "kente-heritage",
    title: "Sacred Kente: Weaving the Soul of Ashanti",
    location: "Bonwire Kente Museum",
    startDate: "2025-10-01",
    endDate: "2026-03-31",
  },
  {
    id: "adinkra-symbols",
    title: "Adinkra: Visual Language of the Akan",
    location: "Kumasi Cultural Centre",
    startDate: "2025-11-15",
    endDate: "2026-04-30",
  },
  {
    id: "cape-coast-legacy",
    title: "Echoes of Cape Coast Castle",
    location: "Cape Coast Castle",
    startDate: "2025-09-01",
    endDate: "2026-02-28",
  },
  {
    id: "asante-gold",
    title: "Golden Stool: Legacy of the Asantehene",
    location: "Manhyia Palace Museum",
    startDate: "2025-12-01",
    endDate: "2026-05-15",
  },
  {
    id: "nkrumah-vision",
    title: "Nkrumah's Pan-African Vision",
    location: "Kwame Nkrumah Memorial Park",
    startDate: "2025-10-15",
    endDate: "2026-03-15",
  },
  {
    id: "contemporary-ghana",
    title: "New Voices: Contemporary Ghanaian Art",
    location: "Nubuke Foundation, Accra",
    startDate: "2026-01-10",
    endDate: "2026-06-30",
  },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const shortDate = (iso: string): string => {
  const [y, m] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
};

/** Only exhibitions that have not ended are advertised. */
const activeExhibitions = (): Exhibition[] => {
  const today = new Date().toISOString().slice(0, 10);
  return EXHIBITIONS.filter((e) => e.endDate >= today);
};

/**
 * The quiet bulletin: a single hairline-bounded mono line near the end of
 * the homepage. Content scrolls slowly; attention is invited, not seized.
 */
export const ExhibitionsTicker = (): JSX.Element | null => {
  const exhibitions = activeExhibitions();
  if (exhibitions.length === 0) return null;

  return (
    <aside
      aria-label="Current exhibitions"
      className="w-full border-t border-ink/10 bg-paper overflow-hidden group"
    >
      <div
        className="flex w-fit whitespace-nowrap py-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/50 group-hover:[animation-play-state:paused]"
        style={{ animation: "roll 90s linear infinite" }}
      >
        {[0, 1].map((dup) =>
          exhibitions.map((e) => (
            <React.Fragment key={`${dup}-${e.id}`}>
              <span className="mx-8">
                {e.title}&ensp;—&ensp;{e.location}&ensp;·&ensp;
                {shortDate(e.startDate)}–{shortDate(e.endDate)}
              </span>
              <span className="text-brand select-none" aria-hidden="true">
                ●
              </span>
            </React.Fragment>
          ))
        )}
      </div>
    </aside>
  );
};
