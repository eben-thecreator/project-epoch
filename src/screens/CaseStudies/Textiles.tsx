import { CatalogueScreen } from "./CatalogueScreen";

export const Textiles = (): JSX.Element => (
  <CatalogueScreen
    collectionKey="textiles"
    title="Material & Texture Catalogue"
    subtitle="Kente and traditional woven materials, documented with provenance and technique."
    loadingLabel="Loading textile collection..."
    emptyLabel="No textiles currently recorded in the collection."
  />
);
