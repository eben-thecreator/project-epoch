import { CatalogueScreen } from "./CatalogueScreen";

export const Documents = (): JSX.Element => (
  <CatalogueScreen
    collectionKey="documents"
    title="Photo & Archive Catalogue"
    subtitle="Photographs, digital media, maps, archives, and related documentation."
    loadingLabel="Loading photo & archive collection..."
    emptyLabel="No documents or photographs currently recorded in the collection."
  />
);
