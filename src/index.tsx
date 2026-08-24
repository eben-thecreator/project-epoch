import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  Navigate,
} from "react-router-dom";
import { ErrorPage } from "./screens/ErrorPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Route-level code splitting: each screen ships as its own chunk so the
// heavy three.js / leaflet bundles only load where they are used.
const Home = lazy(() =>
  import("./screens/Home").then((m) => ({ default: m.Home }))
);
const About = lazy(() => import("./screens/About").then((m) => ({ default: m.About })));
const Contact = lazy(() => import("./screens/Contact").then((m) => ({ default: m.Contact })));
const CaseStudies = lazy(() =>
  import("./screens/CaseStudies").then((m) => ({ default: m.CaseStudies }))
);
const Artifacts = lazy(() =>
  import("./screens/CaseStudies").then((m) => ({ default: m.Artifacts }))
);
const ArtifactDetail = lazy(() =>
  import("./screens/CaseStudies").then((m) => ({ default: m.ArtifactDetail }))
);
const Museum = lazy(() =>
  import("./screens/CaseStudies").then((m) => ({ default: m.Museum }))
);
const Textiles = lazy(() =>
  import("./screens/CaseStudies").then((m) => ({ default: m.Textiles }))
);
const Documents = lazy(() =>
  import("./screens/CaseStudies").then((m) => ({ default: m.Documents }))
);
const MediaAdmin = lazy(() =>
  import("./screens/MediaAdmin").then((m) => ({ default: m.MediaAdmin }))
);
const Reconstruction = lazy(() =>
  import("./screens/Reconstruction").then((m) => ({ default: m.Reconstruction }))
);
const Research = lazy(() => import("./screens/Research").then((m) => ({ default: m.Research })));
const Blog = lazy(() => import("./screens/Blog").then((m) => ({ default: m.Blog })));
const MapScreen = lazy(() => import("./screens/Map/Map").then((m) => ({ default: m.MapScreen })));

/** Shared layout for every route: single error boundary + suspense gate. */
function RootLayout() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoader />}>
        <Outlet />
        <ScrollRestoration />
      </Suspense>
    </ErrorBoundary>
  );
}

function RouteLoader() {
  return (
    <div
      className="min-h-screen w-full bg-paper flex items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex items-center gap-3">
        <span className="w-[7px] h-[7px] rounded-full bg-brand animate-pulse" aria-hidden="true" />
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink/45">
          Opening the archive
        </span>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/case-studies", element: <CaseStudies /> },
      { path: "/case-studies/artifacts", element: <Artifacts /> },
      { path: "/case-studies/artifacts/:id", element: <ArtifactDetail /> },
      { path: "/case-studies/museums", element: <Museum /> },
      { path: "/case-studies/museums/:id", element: <Museum /> },
      { path: "/case-studies/textiles", element: <Textiles /> },
      { path: "/case-studies/documents", element: <Documents /> },
      { path: "/admin/media", element: <MediaAdmin /> },
      { path: "/reconstruction", element: <Reconstruction /> },
      { path: "/gallery", element: <Navigate to="/research" replace /> },
      { path: "/research", element: <Research /> },
      { path: "/blog", element: <Blog /> },
      { path: "/map", element: <MapScreen /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);

/*
 * Deliberately NOT wrapped in <StrictMode>. StrictMode's development-only
 * mount → unmount → remount simulation double-invokes ref callbacks, and
 * react-leaflet@4.2.1's MapContainer re-creates a second Leaflet instance
 * from its stale `context === null` closure on the re-attached node —
 * leaving duplicate map containers on the atlas (and the admin geo-picker).
 * Imperative Leaflet/three lifecycles and StrictMode don't mix until the
 * react-leaflet v5 line; production builds are unaffected either way.
 */
createRoot(document.getElementById("app") as HTMLElement).render(
  <RouterProvider router={router} />
);
