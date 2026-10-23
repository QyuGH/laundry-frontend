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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col max-w-2xl">
          <span className="text-xs font-bold tracking-widest text-brand uppercase font-display mb-1.5">
            Device Alerts
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-text tracking-tight leading-tight">
            {unreadCount > 0 ? "New device alerts." : "You're all caught up."}
          </h2>
          <p className="text-sm text-text-muted mt-2">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
              : "All notifications have been read."}
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:text-brand hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-border shrink-0"
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
        <div className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-xs font-medium text-danger">
          {error}
        </div>
      )}

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
      />

      {notifications.length > 0 && (
        <p className="text-center text-xs text-text-muted font-medium pt-2">
          Select a notification to preview its read and unread states.
        </p>
      )}
    </div>
  );
}

export default NotificationsPage;
