import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/api";
import WebPushBanner from "../components/notifications/WebPushBanner";
import NotificationList from "../components/notifications/NotificationList";

const PUSH_REGISTERED_KEY = "fcm_push_registered";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

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

    const isRegisteredLocally =
      localStorage.getItem(PUSH_REGISTERED_KEY) === "true";
    const isPermissionGranted =
      typeof Notification !== "undefined" &&
      Notification.permission === "granted";

    if (isRegisteredLocally && isPermissionGranted) {
      setIsPushEnabled(true);
    } else {
      setIsPushEnabled(false);
    }
  }, [fetchNotifications]);

  const handlePushRegistered = () => {
    localStorage.setItem(PUSH_REGISTERED_KEY, "true");
    setIsPushEnabled(true);
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
      setError(err.message || "Failed to mark notification as read.");
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
      setError(err.message || "Failed to mark all notifications as read.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="section-stack">
      <div className="section-header">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-text-muted">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "All notifications have been read."}
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-inline px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text-muted hover:text-text bg-surface-bg hover:bg-canvas-bg transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          Mark All as Read
        </button>
      </div>

      {!isPushEnabled && (
        <WebPushBanner
          onRegistered={handlePushRegistered}
          onError={(msg) => setError(msg)}
        />
      )}

      {error && (
        <p className="text-danger text-xs border border-danger/20 rounded-md p-3 bg-danger/10 font-medium">
          {error}
        </p>
      )}

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}

export default NotificationsPage;
