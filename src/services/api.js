import { auth } from "../firebase/firebaseConfig";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Authenticated HTTP wrapper for all backend API calls.
 * Attaches the current user's Firebase JWT token to every request.
 *
 * @param {string} path - The API endpoint path (e.g. "/api/device/weather").
 * @param {object} [options={}] - Optional fetch options (method, body, etc.).
 * @returns {Promise<object>} Parsed JSON response body.
 * @throws {Error} If the response status is not OK.
 */
const apiFetch = async (path, options = {}) => {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers,
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const getDeviceWeather = () => apiFetch("/api/device/weather");

export const getPlan = () => apiFetch("/api/plan");

export const generatePlan = () =>
  apiFetch("/api/plan/generate", { method: "POST" });

export const searchLocation = (query) =>
  apiFetch(`/api/device/location/search?q=${encodeURIComponent(query)}`);

export const updateDeviceLocation = (locationData) =>
  apiFetch("/api/device/location", {
    method: "PUT",
    body: JSON.stringify(locationData),
  });
