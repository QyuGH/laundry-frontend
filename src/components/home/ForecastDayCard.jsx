import { Clock, CheckCircle, CalendarBlank } from "@phosphor-icons/react";

/**
 * Shared card for the recommended day and individual 4-day forecast cards.
 */
function ForecastDayCard({
  label,
  estimatedDryingDuration,
  bodyText,
  emphasized = false,
  children,
}) {
  return (
    <div
      className={`rounded-lg border p-5 sm:p-6 transition-all flex flex-col gap-4 ${
        emphasized
          ? "border-brand-soft bg-surface-raised shadow-card"
          : "border-border bg-surface hover:border-border-strong"
      }`}
    >
      {/* Top Banner / Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {emphasized ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-brand text-white text-[11px] font-bold font-display uppercase tracking-wider shadow-xs">
              <CheckCircle className="w-3.5 h-3.5" weight="bold" />
              Recommended Day
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-canvas border border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider font-display">
              <CalendarBlank className="w-3.5 h-3.5" />
              Forecast
            </span>
          )}
        </div>

        {/* Drying Duration Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-soft text-brand border border-border-brand text-xs font-bold">
          <Clock className="w-4 h-4" weight="bold" />
          <span>{estimatedDryingDuration} Hrs Drying</span>
        </div>
      </div>

      {/* Date Header */}
      <h4 className="text-base sm:text-lg font-bold font-display text-text tracking-tight">
        {label}
      </h4>

      {/* Human Guidance Body */}
      <p className="text-xs sm:text-sm leading-relaxed text-text-muted">
        {bodyText}
      </p>

      {/* Hourly timeline or expandable child content */}
      {children}
    </div>
  );
}

export default ForecastDayCard;
