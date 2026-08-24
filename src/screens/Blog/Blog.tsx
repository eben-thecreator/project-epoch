import { Header } from "../../components/Header";
import { SiteFooter } from "../../components/SiteFooter";
import { Reveal } from "../../components/Reveal";
import { SectionLabel } from "../../components/editorial";
import { pad2 } from "../../lib/format";

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  image: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    title: "Behind the Scenes: Digitizing Ancient Pottery Collections",
    excerpt:
      "How we translated three-dimensional pottery shapes into perfect digital meshes with crisp texture maps using photogrammetry.",
    date: "June 24, 2026",
    author: "Amoah-Yeboah Abena Pokua",
    readTime: "5 min",
    image: "/images/home_about/artifact.jpg",
  },
  {
    title: "Why Map Heritage? The Power of Spatial Context",
    excerpt:
      "Exploring how location coordinates add a rich historical layer to artifact entries, revealing patterns of migration and trade.",
    date: "June 18, 2026",
    author: "Ankudey Ebenezer",
    readTime: "7 min",
    image: "/images/home_about/virtual.jpg",
  },
  {
    title: "Bringing History to Life: Building the 3D Virtual Walkthrough",
    excerpt:
      "A deep dive into WebGL, Three.js, and how we optimized large-scale interior museum models to run seamlessly on mobile browsers.",
    date: "May 29, 2026",
    author: "Elorm Dei-Zanga Aku",
    readTime: "8 min",
    image: "/images/home_about/museum.jpg",
  },
];

export const Blog = (): JSX.Element => {
  return (
    <div className="bg-paper min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-[calc(var(--header-h)+56px)] pb-24 px-5 sm:px-8 lg:px-14">
        <Reveal>
          <SectionLabel>Journal</SectionLabel>
          <h1 className="mt-4 font-display font-light tracking-[-0.015em] leading-[1.02] text-ink text-[clamp(38px,5.4vw,76px)]">
            Field <em className="italic">notes</em>
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-ink/60 max-w-xl">
            Engineering diaries and narrative highlights from the digitisation
            team.
          </p>
        </Reveal>

        {/* Dispatches */}
        <div className="mt-14 grid md:grid-cols-3 gap-x-8 gap-y-14 border-t border-ink/10 pt-10">
          {BLOG_POSTS.map((post, idx) => (
            <Reveal key={idx} delay={idx * 0.06} className="group cursor-default">
              <article>
                <div className="aspect-[4/3] overflow-hidden bg-deep">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform [transition-duration:900ms] ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4 border-b border-ink/12 pb-2.5">
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-brand">
                    {pad2(idx + 1)}
                  </span>
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-ink/40 tabular-nums">
                    {post.date} · {post.readTime}
                  </span>
                </div>
                <h2 className="mt-3 font-display font-light text-[21px] leading-snug text-ink max-w-[24ch]">
                  {post.title}
                </h2>
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink/60">
                  {post.excerpt}
                </p>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-ink/45">
                  {post.author}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};
