import { TShirt, Clock, Gauge } from "@phosphor-icons/react";

function calculateTimeRemaining(percentage, fabricType) {
  if (percentage >= 100) return "Completed";
  if (percentage <= 0) return "Estimating...";

  const baselineHours =
    {
      synthetic: 2,
      blended: 3,
      cotton: 4,
      heavy: 6,
    }[fabricType] || 3;

  const remainingFraction = (100 - percentage) / 100;
  const remainingHours = baselineHours * remainingFraction;

  const hrs = Math.floor(remainingHours);
  const mins = Math.round((remainingHours - hrs) * 60);

  if (hrs === 0 && mins === 0) return "Under 5m";
  if (hrs === 0) return `~${mins}m`;
  if (mins === 0) return `~${hrs}h`;
  return `~${hrs}h ${mins}m`;
}

function DryingEstimate({ session, progressData, isLoading }) {
  const isInactive = !session;
  const isPending = session?.status === "pending";
  const fabricType = session?.fabricType || "synthetic";
  const fabricLabel = fabricType.charAt(0).toUpperCase() + fabricType.slice(1);

  let percentage = 0;
  if (!isInactive && !isPending && progressData?.percentage !== undefined) {
    percentage = Math.min(
      100,
      Math.max(0, Math.round(progressData.percentage)),
    );
  }

  // SVG Radial Geometry
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const timeRemaining =
    isInactive || isPending
      ? "—"
      : calculateTimeRemaining(percentage, fabricType);

  return (
    <section className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col justify-between flex-1 gap-6">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-brand uppercase font-display">
            Live Estimate
          </span>
          <h3 className="text-xl font-bold font-display text-text mt-0.5">
            Drying Progress
          </h3>
        </div>

        {!isInactive && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-brand-soft text-brand text-xs font-semibold">
            <TShirt className="w-3.5 h-3.5" weight="bold" />
            <span>Fabric: {fabricLabel}</span>
          </span>
        )}
      </div>

      {/* Main Center Gauge */}
      <div className="flex flex-col items-center justify-center py-2 sm:py-4">
        <div className="relative flex items-center justify-center">
          <svg
            className="w-48 h-48 sm:w-56 sm:h-56 -rotate-90"
            viewBox="0 0 200 200"
          >
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-brand-soft fill-none"
              strokeWidth="14"
            />
            {/* Active Progress Stroke */}
            {!isInactive && !isPending && (
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-brand fill-none transition-all duration-700 ease-out"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-extrabold font-display text-text tracking-tight">
              {isLoading ? "—" : `${percentage}%`}
            </span>
            <span className="text-xs sm:text-sm font-medium text-text-muted mt-0.5">
              {isInactive ? "inactive" : isPending ? "scheduled" : "dried"}
            </span>
          </div>
        </div>
      </div>

      {/* Supporting Telemetry Strip (Absorbs empty space with real value) */}
      {!isInactive && !isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-lg border border-border bg-canvas/40 p-3.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock className="w-3.5 h-3.5 text-brand" weight="bold" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-display">
                Est. Remaining
              </span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-text">
              {timeRemaining}
            </span>
          </div>

          <div className="rounded-lg border border-border bg-canvas/40 p-3.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Gauge className="w-3.5 h-3.5 text-warning" weight="bold" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-display">
                Drying Speed
              </span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-text">
              Steady
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-canvas/40 p-4 text-center">
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {isInactive
              ? "Start a session from the controls to track live drying progress."
              : "Session is scheduled. Progress tracking begins upon deployment."}
          </p>
        </div>
      )}

      {/* Bottom Footer Note (No Jargon, Concise) */}
      <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
        <span>Calculated from live outdoor heat and humidity</span>
        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
      </div>
    </section>
  );
}

export default DryingEstimate;
