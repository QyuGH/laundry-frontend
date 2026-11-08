import { useState } from "react";
import ForecastDayCard from "./ForecastDayCard";
import {
  Clock,
  Sparkle,
  ArrowsClockwise,
  CloudRain,
  Sun,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";

const formatDayLabel = (dateStr) => {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const formatExpiryLabel = (dateStr) => {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleString("en-US", {
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
    return `${formattedNum} Hrs Drying`;
  }
  return null;
};

function PlannerSection({
  plan,
  isGenerating,
  onGenerate,
  isExpired,
  showLocationButton,
  onChangeLocationClick,
}) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  if (!plan || isExpired) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border pb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-widest text-brand uppercase font-display">
              Weather-Guided Timing
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-text mt-0.5">
              Laundry Planner
            </h3>
          </div>

          {showLocationButton && (
            <button
              onClick={onChangeLocationClick}
              className="px-4 py-2 rounded-md border border-border text-xs font-semibold text-text hover:bg-canvas transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Change Location
            </button>
          )}
        </div>

        <div className="flex flex-col items-center text-center py-6 sm:py-8 max-w-md mx-auto gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-soft text-brand flex items-center justify-center">
            <Clock className="w-6 h-6" weight="bold" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h4 className="text-lg sm:text-xl font-bold font-display text-text">
              {isExpired
                ? "Drying window passed"
                : "Plan your next drying cycle"}
            </h4>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {isExpired ? (
                <>
                  Plan expired on {formatExpiryLabel(plan?.expiresAt)}. Generate
                  a new plan for updated recommendations.
                </>
              ) : (
                <>
                  Generate an automated drying schedule based on live weather
                  forecasts.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
            {showLocationButton && (
              <button
                onClick={onChangeLocationClick}
                className="px-4 py-2.5 rounded-md border border-border text-xs font-semibold text-text hover:bg-canvas transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Change Location
              </button>
            )}

            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-brand hover:bg-brand-600 text-white text-xs font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-interactive disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <ArrowsClockwise
                    className="w-4 h-4 animate-spin"
                    weight="bold"
                  />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkle className="w-4 h-4" weight="fill" />
                  <span>Generate Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const days = Array.isArray(plan?.days) ? plan.days : [];
  const bestDayIndex =
    typeof plan?.bestDayIndex === "number" &&
    plan.bestDayIndex >= 0 &&
    plan.bestDayIndex < days.length
      ? plan.bestDayIndex
      : null;
  const bestDay = bestDayIndex !== null ? days[bestDayIndex] : null;

  const safeActiveIndex = Math.min(
    Math.max(activeDayIndex, 0),
    Math.max(days.length - 1, 0),
  );
  const activeDay = days[safeActiveIndex] || null;

  const hasVerdictLabel = days.some((d) => Boolean(d?.verdictLabel));

  const bestDayDuration = bestDay
    ? formatDryingHours(bestDay.hoursCounted, bestDay.estimatedDryingDuration)
    : null;

  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance && safeActiveIndex < days.length - 1) {
      setActiveDayIndex((prev) => prev + 1);
    } else if (distance < -minSwipeDistance && safeActiveIndex > 0) {
      setActiveDayIndex((prev) => prev - 1);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border pb-5">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-brand uppercase font-display">
            Weather-Guided Timing
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-text mt-0.5">
            Laundry Planner
          </h3>
        </div>

        {showLocationButton && (
          <button
            onClick={onChangeLocationClick}
            className="px-3.5 py-1.5 rounded-md border border-border text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
          >
            Change Location
          </button>
        )}
      </div>

      {bestDay && (
        <div className="rounded-xl border border-brand-soft bg-surface-raised p-5 sm:p-7 shadow-xs flex flex-col gap-0">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkle className="w-5 h-5" weight="fill" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand font-display">
                  Recommendation
                </span>
                <h4 className="text-lg sm:text-xl font-bold font-display text-text">
                  {formatDayLabel(bestDay.date)}
                </h4>
                <span className="text-xs text-text-muted">
                  Best outdoor option across the four-day forecast
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 pb-4">
            <p className="text-sm sm:text-base leading-relaxed text-text">
              {plan.recommendationText}
            </p>
          </div>

          <div className="border-t border-border pt-4 flex flex-col md:flex-row">
            <div className="flex-1 flex items-start gap-3 py-3 md:py-0 md:pr-5">
              <Sun
                className="w-4 h-4 text-brand mt-0.5 shrink-0"
                weight="bold"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-display">
                  Expected Drying Duration
                </span>
                <span className="text-sm font-bold text-text">
                  {bestDayDuration || "Available during daylight"}
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-start gap-3 py-3 md:py-0 md:px-5 border-t border-border md:border-t-0 md:border-l">
              <Clock
                className="w-4 h-4 text-brand mt-0.5 shrink-0"
                weight="bold"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-display">
                  Safest Drying Window
                </span>
                <span className="text-sm font-bold text-text">
                  {bestDay.bestDryingWindow || "Indoor drying recommended"}
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-start gap-3 py-3 md:py-0 md:pl-5 border-t border-border md:border-t-0 md:border-l">
              <CloudRain
                className="w-4 h-4 text-brand mt-0.5 shrink-0"
                weight="bold"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-display">
                  Lowest Peak Rain Chance
                </span>
                <span className="text-sm font-bold text-text">
                  {bestDay.peakRainProbability !== undefined &&
                  bestDay.peakRainProbability !== null
                    ? `${bestDay.peakRainProbability}%`
                    : "Low Risk"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {days.length > 0 && (
        <div className="flex flex-col gap-4 pt-4 border-t border-border">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-brand font-display">
              Four-Day Outlook
            </span>
            <h4 className="text-lg font-bold font-display text-text">
              Day-by-day forecast
            </h4>
            <p className="text-xs text-text-muted">
              Review the expected conditions before choosing when to dry.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface py-3 px-4 flex items-center justify-between shadow-xs">
            <button
              onClick={() => setActiveDayIndex((prev) => Math.max(0, prev - 1))}
              disabled={safeActiveIndex === 0}
              aria-label="Previous Day"
              className="w-9 h-9 rounded-full border border-border bg-surface hover:text-white flex items-center justify-center text-text hover:bg-brand-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <CaretLeft className="w-4 h-4" weight="bold" />
            </button>

            <div className="flex flex-col items-center text-center gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand font-display">
                {`Day ${safeActiveIndex + 1} of ${days.length}`}
              </span>
              <span className="text-sm sm:text-base font-bold text-text font-display">
                {formatDayLabel(activeDay?.date)}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {days.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveDayIndex(dotIdx)}
                    aria-label={`Go to Day ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      dotIdx === safeActiveIndex
                        ? "w-6 bg-brand"
                        : "w-2 bg-border hover:bg-border-strong"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                setActiveDayIndex((prev) => Math.min(days.length - 1, prev + 1))
              }
              disabled={safeActiveIndex === days.length - 1}
              aria-label="Next Day"
              className="w-9 h-9 rounded-full border border-border hover:text-white bg-surface flex items-center justify-center text-text hover:bg-brand-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <CaretRight className="w-4 h-4" weight="bold" />
            </button>
          </div>

          {activeDay && (
            <ForecastDayCard
              day={activeDay}
              dayNumber={safeActiveIndex + 1}
              isBestDay={safeActiveIndex === bestDayIndex}
              outcome={plan.outcome}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          )}

          <p className="text-xs text-text-muted text-center pt-1">
            Swipe or use the arrow buttons to view another day.
          </p>
        </div>
      )}

      {hasVerdictLabel && (
        <p className="text-xs text-text-muted text-center pt-2 border-t border-border">
          Drying hours and percentages are estimates for heavy fabrics like
          jeans.
        </p>
      )}
    </section>
  );
}

export default PlannerSection;
