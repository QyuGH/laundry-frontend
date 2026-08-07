import {
  RainIcon,
  SunIcon,
  RedeployIcon,
  CheckIcon,
  ClockIcon,
} from "../icons/NotificationIcons";

const getEventIcon = (type) => {
  switch (type) {
    case "rain_detected":
      return <RainIcon className="w-5 h-5 text-blue-400" />;
    case "area_cleared_pending":
      return <SunIcon className="w-5 h-5 text-amber-400" />;
    case "auto_redeployed":
      return <RedeployIcon className="w-5 h-5 text-green-400" />;
    case "session_auto_closed":
      return <CheckIcon className="w-5 h-5 text-purple-400" />;
    case "schedule_executed":
      return <ClockIcon className="w-5 h-5 text-indigo-400" />;
    default:
      return <ClockIcon className="w-5 h-5 text-indigo-400" />;
  }
};

const formatPhtTime = (timeData) => {
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
};

function NotificationItem({ item, onMarkAsRead }) {
  const handleClick = () => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={[
        "p-4 rounded-lg border flex items-start gap-block transition cursor-pointer",
        item.isRead
          ? "bg-glass-card/40 border-border-muted/30 text-text-muted"
          : "bg-glass-card border-border-muted border-l-4 border-l-blue-400 text-text",
      ].join(" ")}
    >
      <div className="mt-0.5 shrink-0 p-2 rounded-md bg-bg-dark/50 border border-border-muted/40">
        {getEventIcon(item.type)}
      </div>

      <div className="flex flex-col flex-1 gap-0.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-text">{item.message}</span>
          {!item.isRead && (
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 ml-2" />
          )}
        </div>
        <span className="text-micro text-text-muted/70">
          {formatPhtTime(item.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default NotificationItem;
