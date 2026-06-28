// api.js
// Central module for all HTTP calls to the Node.js backend.
// All components and hooks should use functions from here
// instead of calling fetch() directly.

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
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

// Health check
export const pingBackend = () => apiFetch("/api/health");

// Connection test
export const testConnections = () => apiFetch("/api/test/all");

// Feature API functions will be added here as development progresses.
// Examples:
// export const loginUser = (credentials) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) });
// export const getDeviceStatus = (deviceId) => apiFetch(`/api/devices/${deviceId}`);
