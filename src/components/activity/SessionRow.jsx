/**
 * Helper to format ISO or timestamp object into readable Manila time string.
 */
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

/**
 * Calculates duration string between session start and end times.
 */
function formatDuration(session) {
  if (!session.createdAt || !session.endedAt) return "—";
  const start = new Date(
    session.createdAt._seconds
      ? session.createdAt._seconds * 1000
      : session.createdAt,
  ).getTime();
  const end = new Date(
    session.endedAt._seconds
      ? session.endedAt._seconds * 1000
      : session.endedAt,
  ).getTime();

  if (isNaN(start) || isNaN(end) || end <= start) return "—";
  const diffHours = Math.round((end - start) / (1000 * 60 * 60));
  return diffHours > 0 ? `${diffHours} hrs` : "< 1 hr";
}

/**
 * Renders a single session row item using a 12-column grid.
 */
function SessionRow({ session, onSelect }) {
  const progress = session.finalDryingProgress
    ? Math.round(session.finalDryingProgress)
    : 0;

  const isCompleted =
    session.endReason === "completed" ||
    session.status === "completed" ||
    progress >= 90;

  const statusLabel = isCompleted ? "Completed" : "Terminated";
  const statusBadgeColor = isCompleted
    ? "text-green-400 border-green-400/20 bg-green-400/10"
    : "text-red-400 border-red-400/20 bg-red-400/10";

  return (
    <div
      onClick={() => onSelect(session)}
      className="grid grid-cols-12 gap-2 sm:gap-4 items-center py-3.5 px-3 border-b border-border-muted hover:bg-bg-light/30 transition cursor-pointer text-xs"
    >
      {/* TIMESTAMP */}
      <div className="col-span-12 sm:col-span-3 flex items-center gap-2 text-text font-medium">
        <span className="truncate">{formatPhtTime(session.createdAt)}</span>
      </div>

      {/* FABRIC TYPE */}
      <div className="col-span-6 sm:col-span-3 flex items-center gap-2 text-text-muted capitalize">
        <span className="truncate">
          {session.fabricType
            ? `${session.fabricType} Fabric`
            : "Synthetic Fabric"}
        </span>
      </div>

      {/* DURATION */}
      <div className="col-span-6 sm:col-span-2 text-text-muted sm:text-left text-right">
        {formatDuration(session)}
      </div>

      {/* PROGRESS BAR */}
      <div className="col-span-7 sm:col-span-2 flex items-center gap-2">
        <div className="w-16 bg-bg-light border border-border rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-highlight h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-text font-medium text-[11px]">{progress}%</span>
      </div>

      {/* STATUS BADGE & CHEVRON */}
      <div className="col-span-5 sm:col-span-2 flex items-center justify-between sm:justify-start gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${statusBadgeColor}`}
        >
          ● {statusLabel}
        </span>
        <span className="text-text-muted text-sm font-semibold">&gt;</span>
      </div>
    </div>
  );
}

export default SessionRow;
export { formatPhtTime };
