export type CatalogueCollectionKey =
  | "artifacts"
  | "museums"
  | "textiles"
  | "documents"
  | "needs_review";

export type CatalogueCollectionConfig = {
  key: CatalogueCollectionKey;
  title: string;
  shortTitle: string;
  route: string;
  apiCollection: CatalogueCollectionKey;
  description: string;
  intro: string;
  chips: string[];
};

export const catalogueCollections: CatalogueCollectionConfig[] = [
  {
    key: "artifacts",
    title: "Artifact Collection",
    shortTitle: "Artifacts",
    route: "/case-studies/artifacts",
    apiCollection: "artifacts",
    description: "Objects, masks, beadwork, jewelry, and related physical artifacts.",
    intro:
      "Objects and physical artifacts grouped for practical browsing, review, and media attachment.",
    chips: ["Artifacts", "Masks", "Beadwork", "Jewelry"],
  },
  {
    key: "museums",
    title: "Museums & Monuments",
    shortTitle: "Museums",
    route: "/case-studies/museums",
    apiCollection: "museums",
    description: "Museums, monuments, forts, castles, and site-based heritage records.",
    intro:
      "Historic places and institutions grouped together so site records stay practical to browse.",
    chips: ["Museums", "Monuments", "Forts", "Castles"],
  },
  {
    key: "textiles",
    title: "Textiles & Fabrics",
    shortTitle: "Textiles",
    route: "/case-studies/textiles",
    apiCollection: "textiles",
    description: "Materials, fabrics, textiles, cloth, and woven heritage records.",
    intro:
      "Fabrics and textile-based heritage grouped into one place for easier cataloguing.",
    chips: ["Textiles", "Fabrics", "Materials", "Woven Heritage"],
  },
  {
    key: "documents",
    title: "Documents & Digital Media",
    shortTitle: "Documents",
    route: "/case-studies/documents",
    apiCollection: "documents",
    description: "Photographs, digital media, maps, archives, and related documentation.",
    intro:
      "Documents and digital media kept as a separate catalogue bucket for practical archival use.",
    chips: ["Photographs", "Documents", "Archives", "Digital Media"],
  },
  {
    key: "needs_review",
    title: "Needs Review",
    shortTitle: "Review",
    route: "/case-studies/review",
    apiCollection: "needs_review",
    description: "Digitized records that still need classification in QGIS or the database.",
    intro:
      "Unclassified records are shown here so nothing digitized gets hidden from the catalogue.",
    chips: ["Unclassified", "Pending Review", "Needs Typing"],
  },
];

export const getCatalogueCollection = (key: CatalogueCollectionKey) => {
  return catalogueCollections.find((collection) => collection.key === key);
};
