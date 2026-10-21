import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useAuth } from "../../context/AuthContext";
import useRtdbListener from "../../hooks/useRtdbListener";
import { getUserNotifications } from "../../services/api";
import {
  House,
  Broadcast,
  ClockCounterClockwise,
  Bell,
  User,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: House },
  { label: "Monitoring", path: "/monitoring", icon: Broadcast },
  { label: "Activity Log", path: "/logs", icon: ClockCounterClockwise },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Account", path: "/settings", icon: User },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Home", path: "/", icon: House },
  { label: "Monitoring", path: "/monitoring", icon: Broadcast },
  { label: "Activity Log", path: "/logs", icon: ClockCounterClockwise },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Account", path: "/settings", icon: User },
];

/**
 * Root layout wrapper for all authenticated pages.
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
    <div className="flex h-screen h-[100dvh] bg-canvas text-text font-body overflow-hidden transition-colors duration-150">
      <Sidebar
        isCollapsed={isCollapsed}
        navItems={NAV_ITEMS}
        unreadCount={unreadCount}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuToggle={handleMenuToggle} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="page-shell pt-4 pb-28 md:py-6">
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
