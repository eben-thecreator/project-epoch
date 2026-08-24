export type MediaItem = {
  id: string;
  assetId: string;
  mediaType: "image" | "video" | "audio" | "model" | "file";
  filePath: string;
  fileName: string | null;
  caption: string | null;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HeritageAsset = {
  id: string;
  name: string | null;
  alternative_name: string | null;
  description: string | null;
  asset_type: string | null;
  asset_category: string | null;
  cultural_group: string | null;
  geometry: { type: string; coordinates: number[] } | null;
  location_accuracy: string | null;
  elevation_m: number | null;
  gps_accuracy_m: number | null;
  region: string | null;
  district: string | null;
  community: string | null;
  location_description: string | null;
  height_m: number | null;
  width_m: number | null;
  length_m: number | null;
  diameter_m: number | null;
  weight_kg: number | null;
  material: string | null;
  secondary_material: string | null;
  technique: string | null;
  condition: string | null;
  damage_type: string | null;
  conservation_status: string | null;
  period: string | null;
  period_start: number | null;
  period_end: number | null;
  estimated_age: string | null;
  discovered_date: string | null;
  recorded_date: string | null;
  origin_known: boolean | null;
  origin_location: string | null;
  current_location: string | null;
  ownership: string | null;
  data_completeness_score: number | null;
  verification_status: string | null;
  data_source: string | null;
  notes: string | null;
  observer: string | null;
  survey_method: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  media: MediaItem[];
};

export type AssetSummary = {
  total_assets: number;
  assets_with_geometry: number;
  point_assets: number;
  line_assets: number;
  polygon_assets: number;
  newest_created_at: string | null;
  newest_updated_at: string | null;
};

export type AdminTab = "dashboard" | "assets" | "media" | "trash";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};
