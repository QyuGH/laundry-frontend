import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
  { label: "Monitoring", path: "/monitoring", icon: MonitoringIcon },
  { label: "Activity Log", path: "/logs", icon: ActivityLogIcon },
  { label: "Notifications", path: "/notifications", icon: NotificationIcon },
  { label: "Account", path: "/settings", icon: AccountSettingsIcon },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Home", path: "/", icon: HomeIcon },
  { label: "Activity Log", path: "/logs", icon: ActivityLogIcon },
  { label: "Monitoring", path: "/monitoring", icon: MonitoringIcon },
  { label: "Notifications", path: "/notifications", icon: NotificationIcon },
  { label: "Account", path: "/settings", icon: AccountSettingsIcon },
];

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

  const handleMenuToggle = () => setIsCollapsed((prev) => !prev);

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
    <div className="flex h-screen h-[100dvh] bg-bg-dark text-text overflow-hidden transition-colors duration-150">
      <Sidebar
        isCollapsed={isCollapsed}
        navItems={NAV_ITEMS}
        unreadCount={unreadCount}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuToggle={handleMenuToggle} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="page-shell py-4">
            <Outlet
              context={{ onNotificationsUpdated: fetchUnreadNotifications }}
            />
          </div>
        </main>

        <BottomNav navItems={BOTTOM_NAV_ITEMS} unreadCount={unreadCount} />
      </div>
    </div>
  );
}

export default AppLayout;
