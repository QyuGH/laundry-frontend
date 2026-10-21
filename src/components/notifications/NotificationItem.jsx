import {
  CloudRain,
  Sun,
  ArrowsClockwise,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";

function getEventIcon(type) {
  switch (type) {
    case "rain_detected":
      return <CloudRain size={18} className="text-warning" />;
    case "area_cleared_pending":
      return <Sun size={18} className="text-info" />;
    case "auto_redeployed":
      return <ArrowsClockwise size={18} className="text-success" />;
    case "session_auto_closed":
      return <CheckCircle size={18} className="text-success" />;
    case "schedule_executed":
      return <Clock size={18} className="text-primary" />;
    default:
      return <Clock size={18} className="text-primary" />;
  }
}

function formatPhtTime(timeData) {
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
}

function NotificationItem({ item, onMarkAsRead }) {
  const handleClick = () => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`card-shell flex items-start gap-3 transition-colors cursor-pointer ${
        item.isRead
          ? "border-border-muted bg-surface-bg/60 text-text-muted hover:bg-canvas-bg/50"
          : "border-border bg-surface-bg text-text hover:bg-canvas-bg/50"
      }`}
    >
      <div className="p-2 rounded-md bg-canvas-bg border border-border-muted shrink-0">
        {getEventIcon(item.type)}
      </div>

      <div className="flex flex-col flex-1 gap-1 text-xs">
        <div className="flex items-start justify-between gap-block">
          <span
            className={`font-semibold leading-snug ${
              item.isRead ? "text-text-muted" : "text-text"
            }`}
          >
            {item.message}
          </span>
          {!item.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
          )}
        </div>
        <span className="text-xs text-text-muted tracking-wide">
          {formatPhtTime(item.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default NotificationItem;
