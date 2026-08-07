import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/api";
import WebPushBanner from "../components/notifications/WebPushBanner";
import NotificationList from "../components/notifications/NotificationList";

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
    } catch {
      // Quietly ignore mark as read failures
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
    } catch {
      setError("Failed to mark all notifications as read.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="section-stack">
      <div className="section-header pb-stack border-b border-border-muted">
        <div>
          <h1 className="text-text text-base font-semibold tracking-wide">
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
          className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg disabled:opacity-40 shrink-0"
        >
          Mark All as Read
        </button>
      </div>

      {!isPushEnabled && (
        <WebPushBanner
          onRegistered={() => setIsPushEnabled(true)}
          onError={(msg) => setError(msg)}
        />
      )}

      {error && (
        <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-400 rounded-md text-xs font-medium">
          {error}
        </div>
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
