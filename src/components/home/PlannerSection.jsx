import { useState } from "react";
import HourlyForecast from "./HourlyForecast";
import ForecastDayCard from "./ForecastDayCard";
import { Clock, Sparkle, ArrowsClockwise } from "@phosphor-icons/react";

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

function PlannerSection({
  plan,
  isGenerating,
  onGenerate,
  isExpired,
  showLocationButton,
  onChangeLocationClick,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeHourlyIndex, setActiveHourlyIndex] = useState(null);

  const handleHourlyToggle = (index) => {
    setActiveHourlyIndex((prev) => (prev === index ? null : index));
  };

  if (!plan || isExpired) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border pb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-widest text-brand uppercase font-display">
              Weather-Guided Timing
            </span>
            <h3 className="text-lg font-bold font-display text-text mt-0.5">
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

  const bestDay = plan.days[plan.bestDayIndex];

  return (
    <section className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border pb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-brand uppercase font-display">
            Weather-Guided Timing
          </span>
          <h3 className="text-lg font-bold font-display text-text mt-0.5">
            Laundry Planner
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {showLocationButton && (
            <button
              onClick={onChangeLocationClick}
              className="px-3.5 py-1.5 rounded-md border border-border text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
            >
              Change Location
            </button>
          )}

          <button
            onClick={() => {
              setIsExpanded((prev) => !prev);
              if (isExpanded) setActiveHourlyIndex(null);
            }}
            className="px-3.5 py-1.5 rounded-md border border-border text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
          >
            {isExpanded ? "Collapse 4-Day Plan" : "Expand 4-Day Plan"}
          </button>
        </div>
      </div>

      <ForecastDayCard
        label={formatDayLabel(bestDay.date)}
        estimatedDryingDuration={bestDay.estimatedDryingDuration}
        bodyText={plan.recommendationText}
        emphasized
      />

      {isExpanded && (
        <div className="flex flex-col gap-4 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted font-display">
            Full 4-Day Breakdown
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.days.map((day, index) => {
              const isHourlyOpen = activeHourlyIndex === index;
              const hasHourlyData =
                Array.isArray(day.hourlyBreakdown) &&
                day.hourlyBreakdown.length > 0;

              return (
                <div key={index} className="flex flex-col">
                  <ForecastDayCard
                    label={`Day ${index + 1}: ${formatDayLabel(day.date)}`}
                    estimatedDryingDuration={day.estimatedDryingDuration}
                    bodyText={day.verdict}
                  >
                    {hasHourlyData && (
                      <div className="pt-2 border-t border-border mt-auto">
                        <button
                          onClick={() => handleHourlyToggle(index)}
                          className="w-full py-2 rounded-md border border-border text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
                        >
                          {isHourlyOpen
                            ? "Hide Hourly Timeline"
                            : "View Hourly Timeline"}
                        </button>
                      </div>
                    )}
                  </ForecastDayCard>

                  {isHourlyOpen && (
                    <div className="p-4 mt-2 rounded-lg border border-border bg-surface-raised">
                      <HourlyForecast hours={day.hourlyBreakdown} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default PlannerSection;
