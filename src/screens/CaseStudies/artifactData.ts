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
    imageUrl: "/images/caseStudies/artifact1.jpg",
    modelUrl: "/models/artifact1.glb",
    weight: "135.75 oz",
    height: "17.53 cm",
  },
  {
    id: "Skull 233",
    title: "Rocket Launcher",
    date: "15th Century",
    location: "Bawku",
    currentLocation: "Ghana Monuments and Management Board, Accra Museum",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    imageUrl: "/images/caseStudies/artifact2.jpg",
    modelUrl: "/models/artifact2.glb",
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
    imageUrl: "/images/caseStudies/artifact3.jpg",
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
    imageUrl: "/images/caseStudies/artifact4.jpg",
    modelUrl: "/models/artifact4.glb",
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
    imageUrl: "/images/caseStudies/artifact5.jpg",
    modelUrl: "/models/artifact5.glb",
    weight: "42.75 oz",
    height: "8.25 cm",
  },
  {
    id: "textile-art",
    title: "Me Ne Wo Sre Kwa",
    date: "1750s",
    location: "West Africa",
    description:
      "Colorful textile artwork representing cultural stories and traditional weaving methods. Each pattern in Kente cloth has a specific meaning and significance in West African culture.",
    imageUrl: "/images/caseStudies/artifact6.jpg",
    modelUrl: "/models/artifact6.glb",
    weight: "68.40 oz",
    height: "25.10 cm",
    currentLocation: "Kumasi, Cultural Institute",
  },
  {
    id: "textile-art",
    title: "Nyatepe",
    date: "1750s",
    location: "West Africa",
    description:
      "Colorful textile artwork representing cultural stories and traditional weaving methods. Each pattern in Kente cloth has a specific meaning and significance in West African culture.",
    imageUrl: "/images/caseStudies/artifact7.jpg",
    modelUrl: "/models/artifact6.glb",
    weight: "68.40 oz",
    height: "25.10 cm",
    currentLocation: "Kumasi, Cultural Institute",
  },
  {
    id: "textile-art",
    title: "Kente Pot",
    date: "1750s",
    location: "West Africa",
    description:
      "Colorful textile artwork representing cultural stories and traditional weaving methods. Each pattern in Kente cloth has a specific meaning and significance in West African culture.",
    imageUrl: "/images/caseStudies/artifact8.jpg",
    modelUrl: "/models/artifact6.glb",
    weight: "68.40 oz",
    height: "25.10 cm",
    currentLocation: "Kumasi, Cultural Institute",
  },
  {
    id: "textile-art",
    title: "Kente Pot",
    date: "1750s",
    location: "West Africa",
    description:
      "Colorful textile artwork representing cultural stories and traditional weaving methods. Each pattern in Kente cloth has a specific meaning and significance in West African culture.",
    imageUrl: "/images/caseStudies/artifact8.jpg",
    modelUrl: "/models/artifact6.glb",
    weight: "68.40 oz",
    height: "25.10 cm",
    currentLocation: "Kumasi, Cultural Institute",
  },
];

// Helper function to get an artifact by ID
export const getArtifactById = (id: string): Artifact | undefined => {
  return allArtifacts.find(artifact => artifact.id === id);
};