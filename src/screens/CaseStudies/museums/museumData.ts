// Shared museum data source
export interface Museum {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  imageUrl: string;
  collectionSize?: number;
  website?: string;
  established?: number;
  featuredArtifactIds?: string[];
  modelUrl?: string; 
}

export const allMuseums: Museum[] = [
  {
    id: "national-museum-accra",
    title: "National Museum of Ghana",
    location: "Accra, Ghana",
    type: "Historical",
    description: "The National Museum of Ghana showcases the country's rich cultural heritage, including archaeological and ethnographic materials.",
    imageUrl: "/images/caseStudies/museum/museum 1.jpg",
    modelUrl: "/models/museumModels/museum1.glb",
    collectionSize: 12000,
    website: "https://nationalmuseum.gov.gh",
    established: 1957,
    featuredArtifactIds: ["skull-233"]
  },
  {
    id: "heritage-center-lagos",
    title: "Nigeria National Museum",
    location: "Lagos, Nigeria",
    type: "Cultural",
    description: "A premier destination for exploring Nigerian cultural artifacts, traditional arts, and archaeological findings.",
    imageUrl: "/images/caseStudies/museum/museum 2.jpg",
    modelUrl: "/models/heritage-center-lagos.glb",
    collectionSize: 15000,
    website: "https://nigerianmuseum.org",
    established: 1956,
  },{
    id: "nairobi-national-museum",
    title: "Nairobi National Museum",
    location: "Nairobi, Kenya",
    type: "Historical",
    description: "Kenya's national museum showcasing the country's rich cultural heritage, natural history, and archaeological findings.",
    imageUrl: "/images/caseStudies/museum/museum 3.jpg",
    modelUrl: "/models/nairobi-national-museum.glb",
    collectionSize: 7500,
    website: "https://museums.or.ke",
    established: 1910,
    featuredArtifactIds: ["wooden-stone"]
  },
  {
    id: "capetown-cultural-center",
    title: "District Six Museum",
    location: "Cape Town, South Africa",
    type: "Cultural",
    description: "A cultural center preserving the history of forced removals and celebrating the vibrant community that once was.",
    imageUrl: "/images/caseStudies/museum/museum 4.jpg",
    modelUrl: "/models/capetown-cultural-center.glb",
    collectionSize: 3000,
    website: "https://districtsix.co.za",
    established: 1997,
    featuredArtifactIds: ["traditional-mask"]
  },
  {
    id: "benin-royal-museum",
    title: "Royal Palace Museum",
    location: "Benin City, Nigeria",
    type: "Historical",
    description: "Historical museum showcasing the artifacts and cultural heritage of the Benin Empire, including bronze works and royal regalia.",
    imageUrl: "/images/caseStudies/museum/museum 5.jpg",
    modelUrl: "/models/benin-royal-museum.glb",
    collectionSize: 1200,
    website: "https://beninmuseum.ng",
    established: 1916,
    featuredArtifactIds: ["bronze-sculpture"]
  },
  {
    id: "ethnographic-museum",
    title: "Museum of West African Art",
    location: "Abidjan, Côte d'Ivoire",
    type: "Ethnographic",
    description: "Dedicated to preserving and showcasing West African ethnographic materials, traditional crafts, and contemporary art.",
    imageUrl: "/images/caseStudies/museum/museum 6.jpg",
    modelUrl: "/models/ethnographic-museum.glb",
    collectionSize: 8500,
    website: "https://mowaamuseum.ci",
    established: 2021,
  },
  {
    id: "regional-museum-bamako",
    title: "National Museum of Mali",
    location: "Bamako, Mali",
    type: "Historical",
    description: "Features artifacts from ancient Mali Empire and local cultures, including archaeological findings and traditional crafts.",
    imageUrl: "/images/caseStudies/museum/museum 7.jpg",
    modelUrl: "/models/regional-museum-bamako.glb",
    collectionSize: 10000,
    website: "https://nationalmuseum.mali.gov.ml",
    established: 1958,
  },
  {
    id: "cultural-institute-dakar",
    title: "IFAN Museum of African Arts",
    location: "Dakar, Senegal",
    type: "Cultural",
    description: "Promotes and preserves Senegalese and West African cultural heritage with extensive collections of traditional and contemporary art.",
    imageUrl: "/images/caseStudies/museum/museum 8.jpg",
    modelUrl: "/models/cultural-institute-dakar.glb",
    collectionSize: 18000,
    website: "https://ifanmuseum.sn",
    established: 1960,
  },
  {
    id: "traditional-arts-center",
    title: "Manhyia Palace Museum",
    location: "Kumasi, Ghana",
    type: "Art",
    description: "Focuses on traditional Ghanaian arts and crafts, royal regalia, and cultural artifacts of the Ashanti Kingdom.",
    imageUrl: "/images/caseStudies/museum/museum 9.jpg",
    modelUrl: "/models/traditional-arts-center.glb",
    collectionSize: 5000,
    website: "https://manhyiamuseum.gov.gh",
    established: 1995,
    featuredArtifactIds: ["textile-art-1", "textile-art-2", "textile-art-3"]
  },
  {
    id: "british-museum",
    title: "British Museum",
    location: "London, United Kingdom",
    type: "International",
    description: "One of the world's greatest museums, housing a vast collection of world art and artifacts, including significant African collections.",
    imageUrl: "/images/caseStudies/museum/museum 10.jpg",
    modelUrl: "/models/british-museum.glb",
    collectionSize: 8000000,
    website: "https://britishmuseum.org",
    established: 1753,
    featuredArtifactIds: ["traditional-pottery"]
  },
  {
    id: "african-heritage-museum",
    title: "African Heritage Museum",
    location: "Cairo, Egypt",
    type: "Cultural",
    description: "A comprehensive museum dedicated to showcasing the rich cultural heritage of the African continent, featuring artifacts from various periods and regions.",
    imageUrl: "/images/caseStudies/caseStudy museum 11.jpg",
    modelUrl: "/models/african-heritage-museum.glb",
    collectionSize: 25000,
    website: "https://africanheritage.org.eg",
    established: 2005,
    featuredArtifactIds: ["african-pottery", "tribal-sculpture"]
  },
  {
    id: "pan-african-museum",
    title: "Pan-African Museum",
    location: "Addis Ababa, Ethiopia",
    type: "Historical",
    description: "Celebrating the unity and diversity of African cultures, this museum presents artifacts and exhibits that highlight the continent's rich history.",
    imageUrl: "/images/caseStudies/caseStudy musum 2.jpg",
    modelUrl: "/models/pan-african-museum.glb",
    collectionSize: 18500,
    website: "https://panafricanmuseum.org.et",
    established: 1963,
    featuredArtifactIds: ["ceremonial-mask"]
  }
];