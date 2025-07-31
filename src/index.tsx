import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Home } from "./screens/Home";
import { About } from "./screens/About";
import { Contact } from "./screens/Contact";
import { News } from "./screens/News";
import { CaseStudies } from "./screens/CaseStudies";
import { ArtifactDetails } from "./screens/CaseStudies";
import { Artifacts } from "./screens/CaseStudies";
import { Reconstruction } from "./screens/Reconstruction";
import { Gallery } from "./screens/Gallery";
import { Map } from "./screens/Map";
import { Research } from "./screens/Research";
import { Partners } from "./screens/Partners";

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
    path: "/news",
    element: <News />,
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
    path: "/case-studies/:id",
    element: <ArtifactDetails />,
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
    path: "/map",
    element: <Map />,
  },
  {
    path: "/research",
    element: <Research />,
  },
  {
    path: "/partners",
    element: <Partners />,
  },
]);

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);