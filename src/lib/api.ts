const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const apiUrl = (path: string) => `${API_BASE}${path}`;

export const mediaUrl = (path: string) => {
  if (path.startsWith("/uploads/") || path.startsWith("uploads/")) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  return apiUrl(path);
};
