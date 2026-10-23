import {
  TShirt,
  Clock,
  CheckCircle,
  XCircle,
  CaretRight,
} from "@phosphor-icons/react";

export function parseLogTimestamp(timeData) {
  if (!timeData) return null;
  if (typeof timeData === "object" && timeData._seconds !== undefined) {
    return new Date(timeData._seconds * 1000);
  }
  return new Date(timeData);
}

export function formatPhtTime(timeData) {
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

function formatDuration(session) {
  if (!session.createdAt || !session.endedAt) return "Under 1 hr";
  const start = parseLogTimestamp(session.createdAt)?.getTime();
  const end = parseLogTimestamp(session.endedAt)?.getTime();

  if (!start || !end || isNaN(start) || isNaN(end) || end <= start) {
    return "Under 1 hr";
  }
  const diffMinutes = Math.max(1, Math.round((end - start) / (1000 * 60)));
  if (diffMinutes < 60) return "Under 1 hr";
  const diffHours = Math.round(diffMinutes / 60);
  return diffHours === 1 ? "1 hr" : `${diffHours} hrs`;
}

function SessionRow({ session, onSelect }) {
  const progress = session.finalDryingProgress
    ? Math.round(session.finalDryingProgress)
    : 0;

  const isCompleted =
    session.endReason === "completed" ||
    session.status === "completed" ||
    progress >= 90;

  const fabricLabel = session.fabricType
    ? `${session.fabricType} Fabric`
    : "Synthetic Fabric";

  const durationLabel = formatDuration(session);

  return (
    <div
      onClick={() => onSelect(session)}
      className="group rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card hover:border-brand/40 hover:shadow-elevated hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-5 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-md bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white transition-all duration-200 flex items-center justify-center shrink-0">
            <TShirt className="w-5 h-5" weight="bold" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold font-display text-text group-hover:text-brand transition-colors duration-200 truncate">
              {fabricLabel}
            </span>
            <span className="text-xs text-text-muted mt-0.5 font-medium">
              {formatPhtTime(session.createdAt)}
            </span>
          </div>
        </div>

        <div className="hidden md:block md:col-span-1 flex justify-center">
          <div className="w-px h-10 bg-border mx-auto" />
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
              Duration
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="w-4 h-4 text-brand shrink-0" weight="bold" />
              <span className="text-sm font-semibold font-display text-text">
                {durationLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block md:col-span-1 flex justify-center">
          <div className="w-px h-10 bg-border mx-auto" />
        </div>

        <div className="md:col-span-3 flex items-center justify-between gap-4">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Progress Reached
              </span>
              <span className="text-sm font-bold font-display text-text">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-brand-soft rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-brand rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          </div>

          <div className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted group-hover:text-brand transition-colors shrink-0">
            <CaretRight
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
              weight="bold"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-3.5 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              isCompleted
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger"
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-4 h-4" weight="fill" />
            ) : (
              <XCircle className="w-4 h-4" weight="fill" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle font-display">
              Final Status
            </span>
            <span
              className={`text-xs font-bold font-display ${
                isCompleted ? "text-success" : "text-danger"
              }`}
            >
              {isCompleted ? "Completed" : "Terminated"}
            </span>
          </div>
        </div>

        <span className="text-xs text-text-muted font-medium">
          {isCompleted
            ? "Target dryness reached successfully."
            : "Session ended before drying was complete."}
        </span>
      </div>
    </div>
  );
}

export default SessionRow;
