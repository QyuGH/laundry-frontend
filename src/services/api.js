import { auth } from "../firebase/firebaseConfig";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Authenticated HTTP wrapper for all backend API calls.
 * Attaches the current user's Firebase JWT token to every request.
 *
 * @param {string} path - The API endpoint path.
 * @param {object} [options={}] - Optional fetch options.
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

// Home Page Routes
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

// Monitoring Page Routes
export const getActiveSession = () => apiFetch("/api/session/active");
export const startSession = (sessionData) =>
  apiFetch("/api/session/start", {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
export const deploySession = () =>
  apiFetch("/api/session/deploy", { method: "POST" });
export const retractSession = () =>
  apiFetch("/api/session/retract", { method: "POST" });
export const endSession = () =>
  apiFetch("/api/session/end", { method: "POST" });
export const createSchedule = (scheduleData) =>
  apiFetch("/api/schedule", {
    method: "POST",
    body: JSON.stringify(scheduleData),
  });
export const cancelSchedule = (scheduleId, sessionId) =>
  apiFetch("/api/schedule/cancel", {
    method: "POST",
    body: JSON.stringify({ scheduleId, sessionId }),
  });

// Activity Log Routes
export const getSessionHistory = (limit = 10, lastSessionId = null) => {
  const query = `?limit=${limit}${lastSessionId ? `&lastSessionId=${lastSessionId}` : ""}`;
  return apiFetch(`/api/session/history${query}`);
};
export const getSessionLogs = (sessionId) =>
  apiFetch(`/api/activity-logs/session/${sessionId}`);
export const getDeviceLogs = (limit = 10) =>
  apiFetch(`/api/activity-logs?limit=${limit}`);

// Account Settings Routes
export const getDevice = () => apiFetch("/api/device");
export const updateDeviceName = (name) =>
  apiFetch("/api/device/name", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
export const getDeviceMembers = () => apiFetch("/api/auth/members");
export const addDeviceMember = (memberData) =>
  apiFetch("/api/auth/member", {
    method: "POST",
    body: JSON.stringify(memberData),
  });
export const removeDeviceMember = (memberUserId) =>
  apiFetch(`/api/auth/member/${memberUserId}`, {
    method: "DELETE",
  });
export const updateProfile = (name) =>
  apiFetch("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });

// Notification Routes
export const getUserNotifications = () => apiFetch("/api/notifications");
export const markNotificationAsRead = (notificationId) =>
  apiFetch(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
export const markAllNotificationsAsRead = () =>
  apiFetch("/api/notifications/read-all", { method: "PATCH" });
export const registerFcmToken = (token) =>
  apiFetch("/api/notifications/subscribe", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
export const unregisterFcmToken = (token) =>
  apiFetch("/api/notifications/unsubscribe", {
    method: "DELETE",
    body: JSON.stringify({ token }),
  });
