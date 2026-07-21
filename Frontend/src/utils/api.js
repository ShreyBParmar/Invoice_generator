const fallbackApiUrl = "http://localhost:3000";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL || fallbackApiUrl).replace(/\/$/, "");

export const getApiUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
