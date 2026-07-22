import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { getToken } from "firebase/messaging";
import { messagingPromise } from "../firebase/firebaseConfig";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  registerFcmToken,
} from "../services/api";

/**
 * Renders rain icon for rain retraction events.
 * @returns {JSX.Element}
 */
function RainIcon() {
  return (
    <svg
      className="w-5 h-5 text-blue-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
  );
}

/**
 * Renders sun icon for area cleared pending events.
 * @returns {JSX.Element}
 */
function SunIcon() {
  return (
    <svg
      className="w-5 h-5 text-amber-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

/**
 * Renders redeploy arrow icon for auto-redeploy events.
 * @returns {JSX.Element}
 */
function RedeployIcon() {
  return (
    <svg
      className="w-5 h-5 text-green-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

/**
 * Renders check icon for session auto-close events.
 * @returns {JSX.Element}
 */
function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-purple-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Renders clock icon for schedule execution events.
 * @returns {JSX.Element}
 */
function ClockIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Main Notifications Page component.
 * Displays user notification cards, mark-as-read options, and Web Push enablement toggle.
 *
 * @returns {JSX.Element}
 */
/**
 * Main Notifications Page component.
 * Displays user notification cards, mark-as-read options, and Web Push enablement toggle.
 *
 * @returns {JSX.Element}
 */
function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isPushRegistering, setIsPushRegistering] = useState(false);

  const outletContext = useOutletContext();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserNotifications();
      if (response && response.notifications) {
        setNotifications(response.notifications);
      }
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    if (Notification.permission === "granted") {
      setIsPushEnabled(true);
    }
  }, [fetchNotifications]);

  const handleEnablePush = async () => {
    setIsPushRegistering(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Browser notification permission was denied.");
      }

      const messaging = await messagingPromise;
      if (!messaging) {
        throw new Error("Firebase Messaging is not supported in this browser.");
      }

      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported in this browser.");
      }

      const registration = await navigator.serviceWorker.ready;

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      registration.active?.postMessage({
        type: "INIT_FIREBASE",
        config: firebaseConfig,
      });

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        throw new Error("Failed to retrieve push registration token.");
      }

      await registerFcmToken(token);
      setIsPushEnabled(true);
    } catch (err) {
      setError(err.message || "Failed to enable Web Push Notifications.");
    } finally {
      setIsPushRegistering(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
      if (outletContext?.onNotificationsUpdated) {
        outletContext.onNotificationsUpdated();
      }
    } catch (err) {
      // Quietly catch mark as read errors
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
      if (outletContext?.onNotificationsUpdated) {
        outletContext.onNotificationsUpdated();
      }
    } catch (err) {
      setError("Failed to mark all notifications as read.");
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "rain_detected":
        return <RainIcon />;
      case "area_cleared_pending":
        return <SunIcon />;
      case "auto_redeployed":
        return <RedeployIcon />;
      case "session_auto_closed":
        return <CheckIcon />;
      case "schedule_executed":
        return <ClockIcon />;
      default:
        return <ClockIcon />;
    }
  };

  const formatPhtTime = (timeData) => {
    if (!timeData) return "";
    let dateObj;
    if (
      timeData &&
      typeof timeData === "object" &&
      timeData._seconds !== undefined
    ) {
      dateObj = new Date(timeData._seconds * 1000);
    } else {
      dateObj = new Date(timeData);
    }
    if (isNaN(dateObj.getTime())) return "Invalid Date";

    return (
      dateObj.toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " PHT"
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-5 md:p-6 bg-bg-dark min-h-full flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* TOP HEADER CONTROLS */}
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="text-text text-lg font-semibold tracking-wide">
              Notifications
            </h1>
            <p className="text-text-muted text-xs mt-0.5">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                : "All notifications have been read."}
            </p>
          </div>

          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg disabled:opacity-40"
          >
            Mark All as Read
          </button>
        </div>

        {/* WEB PUSH PROMPT BANNER */}
        {!isPushEnabled && (
          <div className="p-4 rounded-lg border border-highlight/30 bg-highlight/10 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-text text-xs font-semibold">
                Enable Background Web Push
              </span>
              <span className="text-text-muted text-[11px]">
                Receive instant OS alert banners on your device even when this
                tab is closed.
              </span>
            </div>
            <button
              onClick={handleEnablePush}
              disabled={isPushRegistering}
              className="px-3 py-1.5 bg-bg-light border border-border rounded-md text-xs font-semibold text-text hover:bg-highlight transition shrink-0"
            >
              {isPushRegistering ? "Enabling..." : "Enable Push"}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-400 rounded-md text-xs font-medium">
            {error}
          </div>
        )}

        {/* NOTIFICATIONS LIST */}
        <div className="flex flex-col gap-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && handleMarkAsRead(item.id)}
              className={[
                "p-4 rounded-lg border flex items-start gap-4 transition cursor-pointer",
                item.isRead
                  ? "bg-glass-card/40 border-border-muted/30 text-text-muted"
                  : "bg-glass-card border-border-muted border-l-4 border-l-blue-400 text-text",
              ].join(" ")}
            >
              <div className="mt-0.5 shrink-0 p-2 rounded-md bg-bg-dark/50 border border-border-muted/40">
                {getEventIcon(item.type)}
              </div>

              <div className="flex flex-col flex-1 gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">
                    {item.message}
                  </span>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 ml-2" />
                  )}
                </div>
                <span className="text-[10px] text-text-muted/70">
                  {formatPhtTime(item.createdAt)}
                </span>
              </div>
            </div>
          ))}

          {notifications.length === 0 && !isLoading && (
            <div className="p-8 rounded-lg border border-border-muted bg-glass-card text-center flex flex-col items-center justify-center gap-2">
              <p className="text-text-muted text-xs italic">
                No notifications recorded yet. Automated weather and clothesline
                events will appear here.
              </p>
            </div>
          )}

          {isLoading && (
            <p className="text-text-muted text-xs italic text-center py-6">
              Loading notifications...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
