import {
  ArrowLeft,
  ThermometerSimple,
  Drop,
  Wind,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";
import SessionTimeline from "./SessionTimeline";
import { formatPhtTime, formatFabricType } from "./SessionCard";

function calculateConditionLabel(avgTemp, avgHumidity) {
  if (avgTemp === null || avgHumidity === null) return "Unavailable";
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

  const subtitle = isCompleted
    ? "Drying session completed under favorable conditions."
    : "A short drying attempt stopped manually.";

  const avgTemp =
    snapshots &&
    snapshots.avgTemperature !== null &&
    snapshots.avgTemperature !== undefined
      ? `${snapshots.avgTemperature}°C`
      : "Unavailable";

  const avgHumidity =
    snapshots &&
    snapshots.avgHumidity !== null &&
    snapshots.avgHumidity !== undefined
      ? `${snapshots.avgHumidity}%`
      : "Unavailable";

  const conditionText = snapshots
    ? calculateConditionLabel(snapshots.avgTemperature, snapshots.avgHumidity)
    : "Unavailable";

  const intervalText =
    snapshots && snapshots.intervalCount
      ? `Averaged across ${snapshots.intervalCount} recorded intervals`
      : "Averaged across recorded intervals";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-text hover:bg-canvas hover:border-border-strong hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-semibold shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
          <span>Back to past sessions</span>
        </button>
      </div>

      <div className="flex flex-col max-w-2xl">
        <span className="text-xs font-bold tracking-widest text-brand uppercase font-display mb-1.5">
          Session Record
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-text tracking-tight leading-tight">
          Session Details
        </h2>
        <p className="text-sm text-text-muted mt-2">{subtitle}</p>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-brand font-display">
              Fabric Type
            </span>
            <span className="text-sm sm:text-base font-bold font-display text-text mt-1.5 truncate">
              {formatFabricType(session.fabricType)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-brand font-display">
              Outcome
            </span>
            <div className="mt-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-bold ${
                  isCompleted
                    ? "bg-success-soft text-success"
                    : "bg-danger-soft text-danger"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" weight="fill" />
                )}
                <span>{isCompleted ? "Completed" : "Stopped manually"}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-brand font-display">
              Progress Reached
            </span>
            <div className="flex items-center gap-2.5 mt-1.5">
              <div className="w-20 sm:w-24 h-1.5 bg-brand-soft rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm font-bold font-display text-text">
                {progress}%
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-brand font-display">
              Date Created
            </span>
            <span className="text-xs font-medium text-text mt-2">
              {formatPhtTime(session.createdAt)}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
              Environmental Conditions
            </span>
            <h3 className="text-lg font-bold font-display text-text mt-0.5">
              Conditions while drying
            </h3>
          </div>
          <span className="text-xs text-text-muted font-medium">
            {intervalText}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border bg-canvas rounded-lg p-4 sm:p-5 border border-border mt-1">
          <div className="flex items-start gap-3.5 pb-4 sm:pb-0 sm:pr-4">
            <div className="w-9 h-9 rounded-md bg-warning-soft text-warning flex items-center justify-center shrink-0">
              <ThermometerSimple className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Temp
              </span>
              <span className="text-2xl font-bold font-display text-text mt-0.5">
                {avgTemp}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 py-4 sm:py-0 sm:px-4">
            <div className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <Drop className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Humidity
              </span>
              <span className="text-2xl font-bold font-display text-text mt-0.5">
                {avgHumidity}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pt-4 sm:pt-0 sm:pl-4">
            <div className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <Wind className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Rate
              </span>
              <span className="text-xl font-bold font-display text-text mt-0.5">
                {conditionText}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
            Device Events
          </span>
          <h3 className="text-lg font-bold font-display text-text mt-0.5">
            Activity History
          </h3>
        </div>

        <SessionTimeline logs={logs} isLoading={isLoading} />
      </section>
    </div>
  );
}

export default SessionDetailView;
