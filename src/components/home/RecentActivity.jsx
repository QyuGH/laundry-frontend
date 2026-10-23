import { Link } from "react-router-dom";

const EVENT_LABELS = {
  session_started: "Drying session started",
  session_ended: "Drying session completed",
  session_paused: "Drying paused",
  session_resumed: "Drying resumed",
  deploy_triggered: "Clothes rack deployed outdoors",
  retract_triggered: "Clothes rack retracted indoors",
  rain_detected: "Rack retracted due to rain",
  area_cleared: "Rain cleared and timer started",
  auto_redeployment_triggered: "Clothes redeployed automatically",
  auto_redeploy_triggered: "Clothes redeployed automatically",
  auto_close_triggered: "Session closed after drying target met",
  schedule_created: "Drying schedule created",
  schedule_cancelled: "Drying schedule cancelled",
  schedule_executed: "Scheduled drying action executed",
  motor_fault_detected: "Motor alert detected on rack",
  member_added: "New member added to device",
  member_removed: "Member removed from device",
};

const getFriendlyEventName = (eventType) => {
  if (!eventType) return "Activity recorded";
  if (EVENT_LABELS[eventType]) return EVENT_LABELS[eventType];
  return eventType
    .split("_")
    .map((word, idx) =>
      idx === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase(),
    )
    .join(" ");
};

const parseLogTimestamp = (timeData) => {
  if (!timeData) return null;
  if (typeof timeData === "object" && timeData._seconds !== undefined) {
    return new Date(timeData._seconds * 1000);
  }
  return new Date(timeData);
};

const formatPhtTime = (timeData) => {
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
};

const formatRelativeTime = (timeData) => {
  const dateObj = parseLogTimestamp(timeData);
  if (!dateObj || isNaN(dateObj.getTime())) return "Invalid Date";

  const diffMin = Math.floor((Date.now() - dateObj.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

function ActivityList({ logs }) {
  return (
    <div className="divide-y divide-border">
      {logs.map((log) => (
        <div key={log.id} className="py-4 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
              <span className="text-sm font-bold font-display text-text truncate">
                {getFriendlyEventName(log.eventType)}
              </span>
            </div>

            <span className="text-xs font-medium text-text-muted shrink-0">
              {formatRelativeTime(log.timestamp)}
            </span>
          </div>

          <span className="text-xs text-text-muted pl-4.5">
            {formatPhtTime(log.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ isLoading }) {
  return (
    <p className="text-text-muted text-xs italic text-center py-6">
      {isLoading ? "Loading activities..." : "No recent activities recorded."}
    </p>
  );
}

function RecentActivity({ logs, isLoading }) {
  const hasLogs = logs.length > 0;
  const displayLogs = logs.slice(0, 10);

  return (
    <section className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border pb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-brand uppercase font-display">
            Latest Device Events
          </span>
          <h3 className="text-lg font-bold font-display text-text mt-0.5">
            Recent Activity
          </h3>
        </div>

        <Link
          to="/logs"
          className="text-xs font-bold text-brand hover:text-brand-strong transition-colors cursor-pointer"
        >
          View all &gt;
        </Link>
      </div>

      <div>
        {isLoading || !hasLogs ? (
          <EmptyState isLoading={isLoading} />
        ) : (
          <ActivityList logs={displayLogs} />
        )}
      </div>
    </section>
  );
}

export default RecentActivity;
