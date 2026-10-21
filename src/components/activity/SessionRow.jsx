import { CaretRight } from "@phosphor-icons/react";

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

function SessionRow({ session, onSelect }) {
  const progress = session.finalDryingProgress
    ? Math.round(session.finalDryingProgress)
    : 0;

  const isCompleted =
    session.endReason === "completed" ||
    session.status === "completed" ||
    progress >= 90;

  const statusLabel = isCompleted ? "Completed" : "Terminated";
  const statusDotColor = isCompleted ? "bg-success" : "bg-danger";

  const fabricLabel = session.fabricType
    ? `${session.fabricType} Fabric`
    : "Synthetic Fabric";

  const durationLabel = formatDuration(session);

  return (
    <div
      onClick={() => onSelect(session)}
      className="group py-stack px-3 border-b border-border-muted hover:bg-canvas-bg/50 transition-colors cursor-pointer"
    >
      <div className="flex flex-col gap-1.5 sm:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text truncate">
            {formatPhtTime(session.createdAt)}
          </span>
          <div className="flex items-center gap-inline">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`}
            />
            <span className="text-xs text-text-muted">{statusLabel}</span>
            <CaretRight
              size={14}
              className="text-text-muted group-hover:text-text transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted capitalize truncate">
            {fabricLabel} · {durationLabel}
          </span>
          <div className="flex items-center gap-inline">
            <div className="w-12 h-1 bg-border-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-text font-medium">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 text-xs font-medium text-text truncate">
          {formatPhtTime(session.createdAt)}
        </div>
        <div className="col-span-3 text-xs text-text-muted capitalize truncate">
          {fabricLabel}
        </div>
        <div className="col-span-2 text-xs text-text-muted">
          {durationLabel}
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <div className="w-14 h-1.5 bg-border-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-text font-medium">{progress}%</span>
        </div>
        <div className="col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-inline">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`}
            />
            <span className="text-xs text-text-muted">{statusLabel}</span>
          </div>
          <CaretRight
            size={14}
            className="text-text-muted group-hover:text-text transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

export default SessionRow;
export { formatPhtTime };
