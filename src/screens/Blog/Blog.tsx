import { Header } from "../../components/Header";
import { Card, CardContent } from "../../components/ui/card";

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
    excerpt: "How we translated three-dimensional pottery shapes into perfect digital meshes with crisp texture maps using photogrammetry.",
    date: "June 24, 2026",
    author: "Amoah-Yeboah Abena Pokua",
    readTime: "5 min read",
    image: "/images/home_about/artifact.jpg"
  },
  {
    title: "Why Map Heritage? The Power of Spatial Context",
    excerpt: "Exploring how location coordinates add a rich historical layer to artifact entries, revealing patterns of migration and trade.",
    date: "June 18, 2026",
    author: "Ankudey Ebenezer",
    readTime: "7 min read",
    image: "/images/home_about/virtual.jpg"
  },
  {
    title: "Bringing History to Life: Building the 3D Virtual Walkthrough",
    excerpt: "A deep dive into WebGL, Three.js, and how we optimized large-scale interior museum models to run seamlessly on mobile browsers.",
    date: "May 29, 2026",
    author: "Elorm Dei-Zanga Aku",
    readTime: "8 min read",
    image: "/images/home_about/museum.jpg"
  }
];

export const Blog = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-12 pt-20 max-w-5xl mx-auto">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight uppercase">
              The SCHIS Blog
            </h1>
            <p className="text-gray-700 text-lg sm:text-xl max-w-3xl leading-relaxed">
              Updates, engineering diaries, and narrative highlights from our digital cultural preservation team.
            </p>
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post, idx) => (
              <Card key={idx} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h2 className="text-lg font-bold text-black leading-snug line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                    <span className="text-[10px] font-semibold text-gray-700">By {post.author}</span>
                    <button className="text-[10px] font-black text-black uppercase tracking-wider flex items-center gap-1">
                      Read More
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-2.5 h-2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
