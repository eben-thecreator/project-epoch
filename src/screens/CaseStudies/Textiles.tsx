import { CatalogueScreen } from "./CatalogueScreen";
import { getCatalogueCollection } from "./catalogueConfig";

const config = getCatalogueCollection("textiles");

export const Textiles = (): JSX.Element => (
  <CatalogueScreen
    collectionKey="textiles"
    title={config?.title ?? "Textiles & Fabrics"}
    subtitle="Kente and traditional woven materials, documented with provenance and technique."
    loadingLabel="Loading textile collection..."
    emptyLabel="No textiles currently recorded in the collection."
  />
);
