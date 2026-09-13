import SessionTimeline from "./SessionTimeline";
import { formatPhtTime } from "./SessionRow";

function calculateConditionLabel(avgTemp, avgHumidity) {
  if (avgTemp === null || avgHumidity === null) return "—";
  const satVp = 0.6108 * Math.exp((17.27 * avgTemp) / (avgTemp + 237.3));
  const vpd = satVp * (1 - avgHumidity / 100);

  if (vpd >= 1.8) return "Fast Drying";
  if (vpd >= 1.0) return "Normal Drying";
  if (vpd >= 0.5) return "Slow Drying";
  return "Very Slow Drying";
}

function SessionDetailView({ session, logs, snapshots, isLoading, onBack }) {
  const avgTempText =
    snapshots && snapshots.avgTemperature !== null
      ? `${snapshots.avgTemperature}°C`
      : "—";

  const avgHumidityText =
    snapshots && snapshots.avgHumidity !== null
      ? `${snapshots.avgHumidity}%`
      : "—";

  const conditionText = snapshots
    ? calculateConditionLabel(snapshots.avgTemperature, snapshots.avgHumidity)
    : "—";

  return (
    <div className="flex flex-col gap-block">
      <div>
        <button
          onClick={onBack}
          className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text hover:cursor-pointer transition-colors duration-150 bg-surface-bg shrink-0"
        >
          ← Back to Activity Log
        </button>
      </div>

      <div className="card-shell flex flex-col gap-block">
        <div className="section-header pb-2 border-b border-border-muted">
          <h2 className="text-sm font-medium text-text">Session Details</h2>
        </div>

        <div className="stat-grid">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              Fabric Type
            </span>
            <span className="text-sm text-text font-semibold capitalize">
              {session.fabricType || "Synthetic"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              Progress Reached
            </span>
            <span className="text-sm text-text font-semibold">
              {session.finalDryingProgress
                ? `${Math.round(session.finalDryingProgress)}%`
                : "0%"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              End Reason
            </span>
            <span className="text-sm text-text font-semibold capitalize">
              {session.endReason || "Completed"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              Date Created
            </span>
            <span className="text-sm text-text font-semibold">
              {formatPhtTime(session.createdAt)}
            </span>
          </div>
        </div>

        <div className="border-t border-border-muted/40 pt-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold text-text uppercase tracking-wider">
              Environmental Conditions
            </span>
            <span className="text-[10px] text-text-muted italic">
              {snapshots && snapshots.snapshotCount
                ? `Averaged across ${snapshots.snapshotCount} interval${snapshots.snapshotCount > 1 ? "s" : ""}`
                : "No telemetry recorded"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-2.5 bg-bg-light/40 border border-border-muted rounded-md">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                Avg Temperature
              </span>
              <span className="text-sm font-semibold text-text">
                {isLoading ? "..." : avgTempText}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                Avg Humidity
              </span>
              <span className="text-sm font-semibold text-text">
                {isLoading ? "..." : avgHumidityText}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-widest text-text-muted">
                Drying Rate
              </span>
              <span className="text-xs font-semibold text-text truncate">
                {isLoading ? "..." : conditionText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-shell flex flex-col gap-block">
        <div className="section-header pb-2 border-b border-border-muted">
          <h2 className="text-sm font-medium text-text">Activity History</h2>
        </div>

        <SessionTimeline logs={logs} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default SessionDetailView;
