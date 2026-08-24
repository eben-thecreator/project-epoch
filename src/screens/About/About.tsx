import { Header } from "../../components/Header";
import { SiteFooter } from "../../components/SiteFooter";
import { Reveal } from "../../components/Reveal";
import { SectionLabel } from "../../components/editorial";

const PRINCIPLES = [
  {
    title: "Preservation",
    text: "Digitally archiving cultural artifacts to protect them from deterioration and loss.",
  },
  {
    title: "Accessibility",
    text: "Making cultural heritage accessible to global audiences through virtual exhibitions.",
  },
  {
    title: "Education",
    text: "Providing immersive educational experiences that bring history and culture to life.",
  },
];

export const About = (): JSX.Element => {
  return (
    <div className="bg-paper min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-[calc(var(--header-h)+56px)] pb-24 px-5 sm:px-8 lg:px-14">
        <Reveal>
          <SectionLabel>The Project</SectionLabel>
          <h1 className="mt-4 font-display font-light tracking-[-0.015em] leading-[1.05] text-ink text-[clamp(36px,5vw,70px)] max-w-4xl">
            Cultural preservation through{" "}
            <em className="italic">digital innovation</em>
          </h1>
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-12 gap-x-10 gap-y-10 items-start">
          <Reveal delay={0.06} className="lg:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden bg-deep">
              <img
                src="/images/home_about/museum.jpg"
                alt="Museum interior with digital displays"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover [filter:sepia(0.12)_saturate(0.9)]"
              />
            </div>
            <p className="mt-2.5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink/40">
              Digitised exhibition space — a holding rendered in the browser
            </p>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-5 flex flex-col gap-8 lg:pt-6">
            <div>
              <SectionLabel>Mission</SectionLabel>
              <p className="mt-3 text-[15px] leading-[1.75] text-ink/75">
                We empower museums and cultural institutions with practical
                technology to preserve and share their collections — bridging
                the gap between cultural preservation and geomatic innovation.
              </p>
            </div>
            <div>
              <SectionLabel>Method</SectionLabel>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink/60">
                High-fidelity 3D scanning, photogrammetry and spatial
                databases turn artifacts and historic sites into detailed
                digital records — an archive that can be explored, measured,
                and studied from anywhere.
              </p>
            </div>
          </Reveal>
        </div>

        <section aria-label="Principles" className="mt-20 border-t border-ink/10">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.04}>
              <article className="group grid grid-cols-12 gap-x-8 items-baseline py-7 border-b border-ink/10">
                <span className="col-span-2 sm:col-span-1 font-mono text-[11px] tracking-[0.18em] text-ink/35 group-hover:text-brand transition-colors duration-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="col-span-10 sm:col-span-3 font-display font-light text-[22px] leading-tight text-ink">
                  {p.title}
                </h2>
                <p className="col-span-12 sm:col-span-7 mt-1.5 sm:mt-0 text-[13.5px] leading-relaxed text-ink/60">
                  {p.text}
                </p>
              </article>
            </Reveal>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};
