import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Home } from "./screens/Home";
import { About } from "./screens/About";
import { Contact } from "./screens/Contact";
import {
  CaseStudies,
  Artifacts,
  Museum,
  Textiles,
  Documents,
  Review
} from "./screens/CaseStudies";
import { Reconstruction } from "./screens/Reconstruction";
import { Gallery } from "./screens/Gallery";
import { Research } from "./screens/Research";
import { Blog } from "./screens/Blog";
import { MediaAdmin } from "./screens/MediaAdmin";
import { MapScreen } from "./screens/Map/Map";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/case-studies",
    element: <CaseStudies />,
  },
  {
    path: "/case-studies/artifacts",
    element: <Artifacts />,
  },
  {
    path: "/case-studies/museums",
    element: <Museum />,
  },

  {
    path: "/case-studies/textiles",
    element: <Textiles />,
  },
  {
    path: "/case-studies/documents",
    element: <Documents />,
  },
  {
    path: "/case-studies/review",
    element: <Review />,
  },

  {
    path: "/admin/media",
    element: <MediaAdmin />,
  },
  {
    path: "/reconstruction",
    element: <Reconstruction />,
  },
  {
    path: "/gallery",
    element: <Gallery />,
  },
  {
    path: "/research",
    element: <Research />,
  },
  {
    path: "/blog",
    element: <Blog />,
  },
  {
    path: "/map",
    element: <MapScreen />,
  },
]);

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);