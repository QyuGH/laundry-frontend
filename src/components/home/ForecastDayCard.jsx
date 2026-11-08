import {
  Clock,
  CalendarBlank,
  CloudRain,
  Sun,
  WindIcon,
  Hourglass,
} from "@phosphor-icons/react";
import HourlyForecast from "./HourlyForecast";

const VERDICT_DISPLAY_NAMES = {
  Good: "Great for drying",
  Fair: "Slower drying day",
  "Caution Advised": "Dry with care",
  "Not Recommended": "Limited outdoor drying",
};

const BEST_DAY_TAGS = {
  recommended: "Best outdoor option",
  cautious: "Best available option",
  none: "Most drying potential",
};

const formatCardDate = (dateStr) => {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const formatDryingHours = (hoursCounted, estimatedDryingDuration) => {
  if (hoursCounted === 0) {
    return "No drying hours left today";
  }
  if (
    estimatedDryingDuration === null ||
    estimatedDryingDuration === undefined
  ) {
    if (hoursCounted !== undefined && hoursCounted !== null) {
      return "Longer than the available time";
    }
    return null;
  }
  if (typeof estimatedDryingDuration === "number") {
    const rounded = Math.round(estimatedDryingDuration * 10) / 10;
    const formattedNum =
      rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
    return `${formattedNum} Drying Hours`;
  }
  return null;
};

function ForecastDayCard({
  day,
  dayNumber,
  isBestDay = false,
  outcome,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) {
  if (!day) return null;

  const displayName = VERDICT_DISPLAY_NAMES[day.verdictLabel] || "Forecast";
  const bestDayTag = BEST_DAY_TAGS[outcome] || "Best outdoor option";
  const durationText = formatDryingHours(
    day.hoursCounted,
    day.estimatedDryingDuration,
  );
  const windowLabel =
    day.verdictLabel === "Not Recommended" ? "Short dry window" : "Best window";

  const subtitleText = [
    day.verdictLabel ? displayName : null,
    isBestDay ? bestDayTag : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="rounded-xl border border-border bg-surface p-5 sm:p-7 shadow-xs flex flex-col gap-0 select-none"
    >
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand border border-border text-white flex items-center justify-center shrink-0 shadow-xs">
            <CalendarBlank className="w-5 h-5" weight="fill" />
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand font-display">
              {dayNumber ? `Day ${dayNumber}` : "Forecast Details"}
            </span>
            <h4 className="text-lg sm:text-xl font-bold font-display text-text">
              {formatCardDate(day.date)}
            </h4>
            {subtitleText && (
              <span className="text-xs text-text-muted">{subtitleText}</span>
            )}
          </div>
        </div>

        {durationText && (
          <div className="flex items-center gap-1.5 px-4 py-4 rounded-md bg-brand-soft text-brand text-xs font-bold shrink-0">
            <WindIcon className="w-4 h-4" weight="bold" />
            <span>{durationText}</span>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4 pb-4">
        <p className="text-sm sm:text-base leading-relaxed text-text">
          {day.verdict}
        </p>
      </div>

      <div className="border-t border-border pt-4 pb-4 flex flex-col md:flex-row">
        {day.bestDryingWindow ? (
          <div className="flex-1 flex items-start gap-3 py-3 md:py-0 md:pr-5">
            <Sun className="w-4 h-4 text-brand mt-0.5 shrink-0" weight="bold" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-display">
                {windowLabel}
              </span>
              <span className="text-sm font-bold text-text">
                {day.bestDryingWindow}
              </span>
              {day.percentDryInBestWindow !== undefined &&
                day.percentDryInBestWindow !== null && (
                  <span className="text-xs text-text-muted">
                    {day.percentDryInBestWindow}% of a thick load dries
                  </span>
                )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-start gap-3 py-3 md:py-0 md:pr-5">
            <Clock
              className="w-4 h-4 text-brand mt-0.5 shrink-0"
              weight="bold"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-display">
                {windowLabel}
              </span>
              <span className="text-sm font-bold text-text">
                Indoor drying recommended
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 flex items-start gap-3 py-3 md:py-0 md:pl-5 border-t border-border md:border-t-0 md:border-l">
          <CloudRain
            className="w-4 h-4 text-brand mt-0.5 shrink-0"
            weight="bold"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-display">
              Rain Risk
            </span>
            <span className="text-sm font-bold text-text">
              {day.peakRainProbability !== undefined &&
              day.peakRainProbability !== null
                ? `${day.peakRainProbability}% Peak`
                : "Low Risk"}
            </span>
            {day.rainWindow && (
              <span className="text-xs text-text-muted">{day.rainWindow}</span>
            )}
          </div>
        </div>
      </div>

      {Array.isArray(day.hourlyBreakdown) && day.hourlyBreakdown.length > 0 && (
        <HourlyForecast hours={day.hourlyBreakdown} />
      )}
    </div>
  );
}

export default ForecastDayCard;
