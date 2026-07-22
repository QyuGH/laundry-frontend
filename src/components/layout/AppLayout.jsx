import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useAuth } from "../../context/AuthContext";
import useRtdbListener from "../../hooks/useRtdbListener";
import { getUserNotifications } from "../../services/api";
import {
  HomeIcon,
  ActivityLogIcon,
  MonitoringIcon,
  NotificationIcon,
  AccountSettingsIcon,
} from "../icons/NavIcons";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: HomeIcon },
  { label: "Activity Log", path: "/logs", icon: ActivityLogIcon },
  { label: "Monitoring", path: "/monitoring", icon: MonitoringIcon },
  { label: "Notifications", path: "/notifications", icon: NotificationIcon },
  { label: "Account", path: "/settings", icon: AccountSettingsIcon },
];

/**
 * Maps relative paths to display page names for mobile layout headers.
 *
 * @param {string} pathname
 * @returns {string}
 */
const getPageTitle = (pathname) => {
  switch (pathname) {
    case "/":
      return "Home";
    case "/logs":
      return "Activity Log";
    case "/monitoring":
      return "Monitoring";
    case "/notifications":
      return "Notifications";
    case "/settings":
      return "Account Settings";
    default:
      return "Laun-Dry";
  }
};

/**
 * Sends Firebase client configuration to the active service worker via postMessage.
 * Required because service workers in public/ cannot access import.meta.env directly.
 *
 * @param {ServiceWorkerRegistration} registration - The registered service worker instance.
 */
function sendFirebaseConfigToServiceWorker(registration) {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const sw =
    registration.installing ?? registration.waiting ?? registration.active;

  sw?.postMessage({ type: "INIT_FIREBASE", config });
}

/**
 * Root layout wrapper for all authenticated pages.
 * Registers the Firebase Messaging service worker, injects environment config via postMessage,
 * synchronizes notification count via RTDB trigger signals, and passes unreadCount down.
 *
 * @returns {JSX.Element}
 */
function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { claims, user } = useAuth();
  const deviceId = claims?.deviceId ?? null;

  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuToggle = () => setIsCollapsed((prev) => !prev);
  const currentTitle = getPageTitle(location.pathname);

  const { data: triggerStamp } = useRtdbListener(
    deviceId ? `devices/${deviceId}/status/notificationTrigger` : null,
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        sendFirebaseConfigToServiceWorker(registration);

        if (registration.installing) {
          registration.installing.addEventListener("statechange", (event) => {
            if (event.target.state === "activated") {
              sendFirebaseConfigToServiceWorker(registration);
            }
          });
        }
      })
      .catch(() => {});
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await getUserNotifications();
      if (response && response.notifications) {
        const unread = response.notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      // Quietly handle notification fetch errors
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications, triggerStamp, location.pathname]);

  return (
    <div className="flex h-screen bg-bg-dark text-text overflow-hidden transition-colors duration-150">
      <Sidebar
        isCollapsed={isCollapsed}
        navItems={NAV_ITEMS}
        unreadCount={unreadCount}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuToggle={handleMenuToggle} />

        <div className="flex md:hidden items-center justify-between px-5 pt-5 pb-2 bg-bg-dark shrink-0">
          <h2 className="text-lg font-semibold tracking-wide">
            {currentTitle}
          </h2>

          {location.pathname === "/" && (
            <button
              onClick={() => navigate("/monitoring")}
              className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text transition-colors duration-150 bg-bg"
            >
              Start Session &gt;
            </button>
          )}
        </div>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 border border-white-600 content-shell">
          <Outlet
            context={{ onNotificationsUpdated: fetchUnreadNotifications }}
          />
        </main>

        <BottomNav navItems={NAV_ITEMS} unreadCount={unreadCount} />
      </div>
    </div>
  );
}

export default AppLayout;
