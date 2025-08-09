// Shared artifact data source
export interface Artifact {
  id: string;
  title: string;
  date: string;
  location: string;
  currentLocation: string;
  description: string;
  imageUrl: string;
  modelUrl: string;
  weight: string;
  height: string;
}

export const allArtifacts: Artifact[] = [
  {
    id: "traditional-pottery",
    title: "Hulu Hulu",
    date: "14th Century",
    location: "Benin",
    currentLocation: "London, British Museum",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageUrl: "/images/caseStudies/artifacts/cs_a1.jpg",
    modelUrl: "/models/a101.glb",
    weight: "135.75 oz",
    height: "17.53 cm",
  },
  {
    id: "skull-233",
    title: "Rocket Launcher",
    date: "15th Century",
    location: "Bawku",
    currentLocation: "Ghana Monuments and Management Board, Accra Museum",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    imageUrl: "/images/caseStudies/artifacts/cs_a2.jpg",
    modelUrl: "/models/skele.glb",
    weight: "92.45 oz",
    height: "22.10 cm",
  },
  {
    id: "bronze-sculpture",
    title: "Nsibidi 12",
    date: "16th Century",
    location: "Benin City",
    currentLocation: "Lagos, Institute",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    imageUrl: "/images/caseStudies/artifacts/cs_a3.jpg",
    modelUrl: "/models/artifact3.glb",
    weight: "210.30 oz",
    height: "35.75 cm",
  },
  {
    id: "wooden-stone",
    title: "Obour Wooden Stone",
    date: "1850s",
    location: "East Africa",
    currentLocation: "Nairobi, Cultural Center",
    description:
      "Intricately carved wooden stool symbolizing status and craftsmanship in traditional societies. This exceptional piece represents the sophisticated woodworking traditions of East African communities.",
    imageUrl: "/images/caseStudies/artifacts/artifact4.jpg",
    modelUrl: "/models/aa12.glb",
    weight: "85.20 oz",
    height: "15.30 cm",
  },
  {
    id: "traditional-mask",
    title: "Beaded Mask",
    date: "1900s",
    location: "Southern Africa",
    currentLocation: "Cape Town, Museum",
    description:
      "Beautiful collection of beads showcasing traditional jewelry-making techniques. These beads were used not only for adornment but also as a form of communication and currency.",
    imageUrl: "/images/caseStudies/artifacts/artifact5.jpg",
    modelUrl: "/models/artifact123.gltf",
    weight: "42.75 oz",
    height: "8.25 cm",
  },
  {
    id: "textile-art-1",
    title: "Me Ne Wo Sre Kwa",
    date: "1750s",
    location: "West Africa",
    description:
      "Colorful textile artwork representing cultural stories and traditional weaving methods. Each pattern in Kente cloth has a specific meaning and significance in West African culture.",
    imageUrl: "/images/caseStudies/artifacts/artifact6.jpg",
    modelUrl: "/models/skele.glb",
    weight: "68.40 oz",
    height: "25.10 cm",
    currentLocation: "Kumasi, Cultural Institute",
  },
  {
    id: "textile-art-2",
    title: "Nyatepe",
    date: "1750s",
    location: "West Africa",
    description:
      "Colorful textile artwork representing cultural stories and traditional weaving methods. Each pattern in Kente cloth has a specific meaning and significance in West African culture.",
    imageUrl: "/images/caseStudies/artifacts/artifact7.jpg",
    modelUrl: "/models/artifact6.glb",
    weight: "68.40 oz",
    height: "25.10 cm",
    currentLocation: "Kumasi, Cultural Institute",
  },
  {
    id: "textile-art-3",
    title: "Kente Pot",
    date: "1750s",
    location: "West Africa",
    description:
      "Colorful textile artwork representing cultural stories and traditional weaving methods. Each pattern in Kente cloth has a specific meaning and significance in West African culture.",
    imageUrl: "/images/caseStudies/artifacts/artifact8.jpg",
    modelUrl: "/models/artifact6.glb",
    weight: "68.40 oz",
    height: "25.10 cm",
    currentLocation: "Kumasi, Cultural Institute",
  },
  {
    id: "african-pottery",
    title: "Traditional African Pottery",
    date: "18th Century",
    location: "West Africa",
    currentLocation: "Abidjan, Côte d'Ivoire",
    description:
      "Handcrafted pottery showcasing traditional African ceramic techniques. These vessels were used for both practical and ceremonial purposes in various West African cultures.",
    imageUrl: "/images/caseStudies/caseStudy artifact 1.jpg",
    modelUrl: "/models/artifact7.glb",
    weight: "115.30 oz",
    height: "22.75 cm",
  },
  {
    id: "tribal-sculpture",
    title: "Tribal Sculpture",
    date: "19th Century",
    location: "Central Africa",
    currentLocation: "Paris, Quai Branly Museum",
    description:
      "Intricately carved wooden sculpture representing ancestral spirits in traditional Central African beliefs. This piece demonstrates the sophisticated artistry of tribal woodcarvers.",
    imageUrl: "/images/caseStudies/caseStudy artifact 2.jpg",
    modelUrl: "/models/artifact8.glb",
    weight: "265.40 oz",
    height: "42.20 cm",
  },
  {
    id: "ceremonial-mask",
    title: "Ceremonial Mask",
    date: "Early 20th Century",
    location: "East Africa",
    currentLocation: "Nairobi, National Museum",
    description:
      "Elaborate ceremonial mask used in traditional coming-of-age rituals. The intricate patterns and colors hold deep cultural significance in the community's spiritual practices.",
    imageUrl: "/images/caseStudies/caseStudy artifact 3.jpg",
    modelUrl: "/models/artifact9.glb",
    weight: "72.15 oz",
    height: "31.50 cm",
  },
];

// Helper function to get an artifact by ID
export const getArtifactById = (id: string): Artifact | undefined => {
  return allArtifacts.find(artifact => artifact.id === id);
};