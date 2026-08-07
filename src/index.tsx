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
} from "./screens/CaseStudies";
import { Reconstruction } from "./screens/Reconstruction";
import { Gallery } from "./screens/Gallery";
import { Research } from "./screens/Research";
import { Blog } from "./screens/Blog";
import { MediaAdmin } from "./screens/MediaAdmin";
import { MapScreen } from "./screens/Map/Map";
import { ErrorPage } from "./screens/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/about",
    element: <About />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/contact",
    element: <Contact />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/case-studies",
    element: <CaseStudies />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/case-studies/artifacts",
    element: <Artifacts />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/case-studies/museums",
    element: <Museum />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/case-studies/textiles",
    element: <Textiles />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/case-studies/documents",
    element: <Documents />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin/media",
    element: <MediaAdmin />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/reconstruction",
    element: <Reconstruction />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/gallery",
    element: <Gallery />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/research",
    element: <Research />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/blog",
    element: <Blog />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/map",
    element: <MapScreen />,
    errorElement: <ErrorPage />,
  },
]);

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);