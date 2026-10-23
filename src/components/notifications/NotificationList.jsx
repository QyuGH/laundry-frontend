import NotificationItem from "./NotificationItem";

function NotificationList({ notifications, isLoading, onMarkAsRead }) {
  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="text-xs font-medium text-text-muted tracking-wide">
          Loading notifications...
        </span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center shadow-card">
        <p className="text-sm text-text-muted">
          No notifications recorded yet. Automated weather and device events
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notifications.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}

export default NotificationList;
