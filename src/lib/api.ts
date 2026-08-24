const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const apiUrl = (path: string) => `${API_BASE}${path}`;

export const mediaUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Uploaded files are served by the API server, so a configured cross-origin
  // base must be applied; in dev the base is empty and the Vite proxy handles it.
  if (normalized.startsWith("/uploads/")) {
    return `${API_BASE}${normalized}`;
  }
  return apiUrl(normalized);
};
