import NotificationItem from "./NotificationItem";

function NotificationList({ notifications, isLoading, onMarkAsRead }) {
  if (isLoading && notifications.length === 0) {
    return (
      <p className="text-text-muted text-xs italic text-center py-6">
        Loading notifications...
      </p>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="card-shell text-center flex flex-col items-center justify-center gap-stack py-8">
        <p className="text-text-muted text-xs italic">
          No notifications recorded yet. Automated weather and clothesline
          events will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="list-stack">
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
