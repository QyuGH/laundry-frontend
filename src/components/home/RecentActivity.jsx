import { Link } from "react-router-dom";

const EVENT_LABELS = {
  session_started: "Session initialized",
  deploy_triggered: "Pulley deployed manually",
  retract_triggered: "Pulley retracted manually",
  rain_detected: "Rain sensor triggered retraction",
  area_cleared: "Rain cleared, countdown started",
  auto_redeployment_triggered: "Weather cleared: auto-redeploy executed",
  auto_close_triggered: "Dry target met: session auto-closed",
  schedule_created: "Deployment/retraction schedule registered",
  schedule_cancelled: "Scheduled timer cancelled",
  schedule_executed: "Scheduled action executed automatically",
  session_ended: "Session terminated successfully",
};

/**
 * Maps a raw event type to its human-readable label.
 *
 * @param {string} eventType
 * @returns {string}
 */
const getFriendlyEventName = (eventType) =>
  EVENT_LABELS[eventType] || eventType;

/**
 * Parses a Firestore timestamp object or ISO string into a Date.
 * Shared by both the absolute and relative time formatters below.
 *
 * @param {object|string} timeData
 * @returns {Date|null}
 */
const parseLogTimestamp = (timeData) => {
  if (!timeData) return null;
  if (typeof timeData === "object" && timeData._seconds !== undefined) {
    return new Date(timeData._seconds * 1000);
  }
  return new Date(timeData);
};

/**
 * Formats a log timestamp as an absolute PHT date/time string.
 *
 * @param {object|string} timeData
 * @returns {string}
 */
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

/**
 * Formats a log timestamp as a relative "time ago" string.
 *
 * @param {object|string} timeData
 * @returns {string}
 */
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

/**
 * Renders a divided list of activity log rows: leading status dot, label
 * and absolute timestamp on the left, relative time on the right.
 * Shared between the mobile-capped and desktop-scrollable variants.
 *
 * @param {object} props
 * @param {Array<object>} props.logs
 * @returns {JSX.Element}
 */
function ActivityList({ logs }) {
  return (
    <div className="divide-y divide-border-muted ">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start justify-between gap-block py-stack"
        >
          <div className="flex items-start gap-inline">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text">
                {getFriendlyEventName(log.eventType)}
              </span>
              <span className="text-xs text-text-muted tracking-wide">
                {formatPhtTime(log.timestamp)}
              </span>
            </div>
          </div>
          <span className="text-xs text-text-muted shrink-0">
            {formatRelativeTime(log.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading/empty placeholder shared by both Recent Activity variants.
 *
 * @param {object} props
 * @param {boolean} props.isLoading
 * @returns {JSX.Element}
 */
function EmptyState({ isLoading }) {
  return (
    <p className="text-text-muted text-xs italic text-center py-4">
      {isLoading ? "Loading activities..." : "No recent activities."}
    </p>
  );
}

/**
 * Recent Activity section for the Home page.
 * Mobile: capped to the 5 most recent entries, with a link to the full Activity Log.
 * Tablet/desktop: fixed-height card with its own internal scroll for the full list.
 *
 * @param {object} props
 * @param {Array<object>} props.logs - Recent device activity log entries.
 * @param {boolean} props.isLoading - Whether the logs are still being fetched.
 * @returns {JSX.Element}
 */
function RecentActivity({ logs, isLoading }) {
  const hasLogs = logs.length > 0;
  const mobileLogs = logs.slice(0, 5);

  return (
    <div className="card-shell flex flex-col gap-block">
      {/* Integrated Section Header */}
      <div className="section-header pb-2 border-b border-border-muted">
        <h2 className="text-sm font-medium text-text">Recent Activity</h2>
        <Link
          to="/logs"
          className="text-xs text-text-muted hover:text-text transition-colors duration-150"
        >
          View all &gt;
        </Link>
      </div>

      {/* Mobile Activity List */}
      <div className="sm:hidden flex flex-col gap-block">
        {isLoading || !hasLogs ? (
          <EmptyState isLoading={isLoading} />
        ) : (
          <ActivityList logs={mobileLogs} />
        )}
      </div>

      {/* Tablet/Desktop Scrollable Activity List */}
      <div className="hidden sm:flex flex-col h-[380px]">
        <div className="flex-1 overflow-y-auto pr-4">
          {isLoading || !hasLogs ? (
            <EmptyState isLoading={isLoading} />
          ) : (
            <ActivityList logs={logs} />
          )}
        </div>
      </div>
    </div>
  );
}

export default RecentActivity;
