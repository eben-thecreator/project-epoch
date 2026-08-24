import { CatalogueScreen } from "./CatalogueScreen";
import { getCatalogueCollection } from "./catalogueConfig";

const config = getCatalogueCollection("documents");

export const Documents = (): JSX.Element => (
  <CatalogueScreen
    collectionKey="documents"
    title={config?.title ?? "Documents & Digital Media"}
    subtitle="Photographs, digital media, maps, archives, and related documentation."
    loadingLabel="Loading photo & archive collection..."
    emptyLabel="No documents or photographs currently recorded in the collection."
  />
);
