import {
  CloudRain,
  Sun,
  ArrowsClockwise,
  CheckCircle,
  Clock,
  WarningCircle,
  Bell,
} from "@phosphor-icons/react";

function parseLogTimestamp(timeData) {
  if (!timeData) return null;
  if (typeof timeData === "object" && timeData._seconds !== undefined) {
    return new Date(timeData._seconds * 1000);
  }
  return new Date(timeData);
}

function formatPhtTime(timeData) {
  const dateObj = parseLogTimestamp(timeData);
  if (!dateObj || isNaN(dateObj.getTime())) return "Invalid Date";
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

function getNotificationTheme(type) {
  switch (type) {
    case "rain_detected":
      return {
        icon: <CloudRain className="w-5 h-5" weight="bold" />,
        eyebrow: "Weather Alert",
        iconStyles:
          "bg-warning-soft text-warning group-hover:bg-warning group-hover:text-white",
        eyebrowStyles: "text-warning",
        pillStyles: "bg-warning-soft text-warning",
      };
    case "session_auto_closed":
    case "auto_close_triggered":
      return {
        icon: <CheckCircle className="w-5 h-5" weight="bold" />,
        eyebrow: "Session Completed",
        iconStyles:
          "bg-success-soft text-success group-hover:bg-success group-hover:text-white",
        eyebrowStyles: "text-success",
        pillStyles: "bg-success-soft text-success",
      };
    case "auto_redeployed":
    case "auto_redeployment_triggered":
      return {
        icon: <ArrowsClockwise className="w-5 h-5" weight="bold" />,
        eyebrow: "Session Resumed",
        iconStyles:
          "bg-success-soft text-success group-hover:bg-success group-hover:text-white",
        eyebrowStyles: "text-success",
        pillStyles: "bg-success-soft text-success",
      };
    case "motor_fault_detected":
      return {
        icon: <WarningCircle className="w-5 h-5" weight="fill" />,
        eyebrow: "Device Alert",
        iconStyles:
          "bg-danger-soft text-danger group-hover:bg-danger group-hover:text-white",
        eyebrowStyles: "text-danger",
        pillStyles: "bg-danger-soft text-danger",
      };
    case "area_cleared_pending":
    case "area_cleared":
      return {
        icon: <Sun className="w-5 h-5" weight="bold" />,
        eyebrow: "Weather Update",
        iconStyles:
          "bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white",
        eyebrowStyles: "text-brand",
        pillStyles: "bg-brand-soft text-brand",
      };
    case "schedule_executed":
    case "schedule_created":
      return {
        icon: <Clock className="w-5 h-5" weight="bold" />,
        eyebrow: "Schedule Update",
        iconStyles:
          "bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white",
        eyebrowStyles: "text-brand",
        pillStyles: "bg-brand-soft text-brand",
      };
    default:
      return {
        icon: <Bell className="w-5 h-5" weight="bold" />,
        eyebrow: "System Alert",
        iconStyles:
          "bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white",
        eyebrowStyles: "text-brand",
        pillStyles: "bg-brand-soft text-brand",
      };
  }
}

function NotificationItem({ item, onMarkAsRead }) {
  const handleClick = () => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }
  };

  const theme = getNotificationTheme(item.type);

  return (
    <div
      onClick={handleClick}
      className="group rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card hover:border-brand/40 hover:shadow-elevated hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-start gap-4"
    >
      <div
        className={`w-10 h-10 rounded-md transition-all duration-200 flex items-center justify-center shrink-0 mt-0.5 ${theme.iconStyles}`}
      >
        {theme.icon}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider font-display ${theme.eyebrowStyles}`}
          >
            {theme.eyebrow}
          </span>

          {!item.isRead && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider font-display shrink-0 ${theme.pillStyles}`}
            >
              New
            </span>
          )}
        </div>

        <p className="text-base font-bold font-display text-text group-hover:text-brand transition-colors duration-200 mt-1 leading-snug break-words">
          {item.message}
        </p>

        <span className="text-xs text-text-muted mt-2 font-medium">
          {formatPhtTime(item.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default NotificationItem;
