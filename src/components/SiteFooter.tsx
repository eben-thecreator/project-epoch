import { Link } from "react-router-dom";

/**
 * The closing room of the institution. Every public document ends here:
 * an ink surface that gives each page a deliberate final cadence.
 */

const navigate = [
  { label: "Catalogue", to: "/case-studies" },
  { label: "Atlas", to: "/map" },
  { label: "Reconstruction", to: "/reconstruction" },
  { label: "Research", to: "/research" },
];

const collections = [
  { label: "Objects / Artefacts", to: "/case-studies/artifacts" },
  { label: "Heritage Sites", to: "/case-studies/museums" },
  { label: "Materials / Textiles", to: "/case-studies/textiles" },
  { label: "Document Archive", to: "/case-studies/documents" },
];

export const SiteFooter = (): JSX.Element => {
  return (
    <footer className="w-full bg-ink text-paper">
      <div className="px-5 sm:px-8 lg:px-14 pt-16 md:pt-24 pb-8">
        {/* Statement */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-paper/10">
          <h2 className="font-display font-light text-[clamp(30px,4.6vw,58px)] leading-[1.08] tracking-[-0.01em] max-w-3xl">
            An atlas of Ghana&rsquo;s{" "}
            <em className="italic text-paper/80">material culture</em>, kept
            in public.
          </h2>
          <div className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-paper/40 space-y-2 lg:text-right">
            <p>07°57′N&nbsp;&nbsp;001°01′W</p>
            <p>Pre-colonial — Contemporary</p>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 py-12">
          <nav aria-label="Footer navigation">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-paper/35 mb-5">
              (Navigate)
            </p>
            <ul className="space-y-2.5">
              {navigate.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[13px] text-paper/70 hover:text-paper transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Collections">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-paper/35 mb-5">
              (Collections)
            </p>
            <ul className="space-y-2.5">
              {collections.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-[13px] text-paper/70 hover:text-paper transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-paper/35 mb-5">
              (Research Team)
            </p>
            <ul className="space-y-2.5 text-[13px] text-paper/70">
              <li>Amoah-Yeboah Abena Pokua</li>
              <li>Ankudey Ebenezer</li>
              <li>Elorm Dei-Zanga Aku</li>
            </ul>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.28em] text-paper/35 mb-3">
              (Supervisor)
            </p>
            <p className="text-[13px] text-paper/70">Professor Quaye Ballard</p>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-paper/35 mb-5">
              (Contact)
            </p>
            <a
              href="mailto:ebenezer.ankudey@gmail.com"
              className="text-[13px] text-paper/70 hover:text-brand transition-colors duration-200 break-all"
            >
              ebenezer.ankudey@gmail.com
            </a>
            <p className="mt-5 text-[12px] leading-relaxed text-paper/45 max-w-[26ch]">
              Contributions of records, imagery and field data are welcomed
              from institutions and researchers.
            </p>
          </div>
        </div>

        {/* Colophon */}
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 pt-6 border-t border-paper/10">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/35">
            © {new Date().getFullYear()} Project Epoch — Project Work
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/35">
            Spatial Cultural Heritage Information System
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/35">
            A geomatic engineering thesis
          </p>
        </div>
      </div>
    </footer>
  );
};
