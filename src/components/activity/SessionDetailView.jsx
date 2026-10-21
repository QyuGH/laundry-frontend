import {
  ArrowLeft,
  ThermometerSimple,
  Drop,
  Wind,
} from "@phosphor-icons/react";
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
  const progress = session.finalDryingProgress
    ? Math.round(session.finalDryingProgress)
    : 0;

  const isCompleted =
    session.endReason === "completed" ||
    session.status === "completed" ||
    progress >= 90;

  const statusDotColor = isCompleted ? "bg-success" : "bg-danger";
  const outcomeLabel = isCompleted
    ? "Completed"
    : session.endReason || "Terminated";

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
          className="inline-flex items-center gap-inline px-3 py-1.5 border border-border rounded-md text-xs font-medium text-text-muted hover:text-text bg-surface-bg hover:bg-canvas-bg transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Back to Activity Log</span>
        </button>
      </div>

      <div className="card-shell flex flex-col gap-block">
        <div className="section-header pb-2 border-b border-border-muted">
          <h2 className="text-sm font-medium text-text">Session Details</h2>
        </div>

        <div className="stat-grid">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Fabric Type
            </span>
            <span className="text-xs text-text font-semibold capitalize">
              {session.fabricType || "Synthetic"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Progress Reached
            </span>
            <div className="flex items-center gap-inline">
              <div className="w-20 h-1.5 bg-border-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-text font-semibold">
                {progress}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Outcome
            </span>
            <div className="flex items-center gap-inline">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`}
              />
              <span className="text-xs text-text font-semibold capitalize">
                {outcomeLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Date Created
            </span>
            <span className="text-xs text-text font-semibold">
              {formatPhtTime(session.createdAt)}
            </span>
          </div>
        </div>

        <div className="border-t border-border-muted pt-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
            <span className="text-xs font-semibold text-text uppercase tracking-wider">
              Environmental Conditions
            </span>
            <span className="text-xs text-text-muted italic">
              {snapshots && snapshots.snapshotCount
                ? `Averaged across ${snapshots.snapshotCount} interval${snapshots.snapshotCount > 1 ? "s" : ""}`
                : "No telemetry recorded"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-canvas-bg border border-border-muted rounded-md">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <ThermometerSimple
                  size={14}
                  className="text-text-muted shrink-0"
                />
                <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
                  Temp
                </span>
              </div>
              <span className="text-xs font-semibold text-text">
                {isLoading ? "..." : avgTempText}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Drop size={14} className="text-text-muted shrink-0" />
                <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
                  Humidity
                </span>
              </div>
              <span className="text-xs font-semibold text-text">
                {isLoading ? "..." : avgHumidityText}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Wind size={14} className="text-text-muted shrink-0" />
                <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
                  Rate
                </span>
              </div>
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
