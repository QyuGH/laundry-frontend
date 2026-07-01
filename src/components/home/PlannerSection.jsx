import { useState } from "react";
import HourlyForecast from "./HourlyForecast";
import PlaceholderIcon from "../icons/PlaceholderIcon";

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

/**
 * Laundry Planner section.
 * Renders the recommendation card and the 4-day breakdowns.
 *
 * @param {object} props
 * @param {object|null} props.plan - Plan document object.
 * @param {boolean} props.isGenerating - Action generating state.
 * @param {function} props.onGenerate - Trigger function to request a new plan.
 * @returns {JSX.Element}
 */
function PlannerSection({
  plan,
  isGenerating,
  onGenerate,
  isExpired,
  showLocationButton,
  onChangeLocationClick,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHourlyOpen, setIsHourlyOpen] = useState(false);
  // Layout for No Plan OR Expired Plan
  if (!plan || isExpired) {
    return (
      <section>
        <h2 className="text-text text-sm font-medium mb-3">Laundry Planner</h2>
        <div className="rounded-lg border border-border-muted bg-bg p-5 flex flex-col items-center gap-4 text-center">
          {isExpired ? (
            <p className="text-text-muted text-sm max-w-xs">
              Your last generated plan expired at{" "}
              {formatExpiryLabel(plan.expiresAt)}. Generate a new plan to get a
              newer personalized plan!
            </p>
          ) : (
            <p className="text-text-muted text-sm max-w-xs">
              Generate an automated laundry day plan using real-time Open-Meteo
              forecasts rephrased by AI.
            </p>
          )}
          <div className="flex gap-2">
            {/* Show Change Location when there's an expired plan and user has permission */}
            {plan && showLocationButton && (
              <button
                onClick={onChangeLocationClick}
                className="px-4 py-2 border border-border rounded-md text-xs font-medium text-text hover:bg-bg-light transition-colors duration-150"
              >
                Change Location
              </button>
            )}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-bg-light border border-border rounded-md text-xs font-medium text-text hover:bg-highlight transition-colors duration-150 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Plan"}
            </button>
          </div>
        </div>
      </section>
    );
  }
  const bestDay = plan.days[plan.bestDayIndex];
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-text text-sm font-medium">Laundry Planner</h2>
        <div className="flex gap-2">
          {showLocationButton && (
            <button
              onClick={onChangeLocationClick}
              className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text transition-colors duration-150 bg-bg"
            >
              Change Location
            </button>
          )}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text transition-colors duration-150 bg-bg"
          >
            {isExpanded ? "Collapse" : "Expand Plan"}
          </button>
        </div>
      </div>
      {/* Recommended Day Card */}
      <div className="rounded-lg border border-border p-6 bg-glass-card flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-text font-semibold text-base tracking-wide">
            RECOMMENDATION ({formatDayLabel(bestDay.date)})
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
              Rain Probability
            </span>
            <div className="flex items-center gap-1.5 text-text text-sm font-semibold">
              <PlaceholderIcon className="w-4 h-4 text-text-muted" />
              <span>{bestDay.rainProbability}%</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
              Drying Duration
            </span>
            <div className="flex items-center gap-1.5 text-text text-sm font-semibold">
              <PlaceholderIcon className="w-4 h-4 text-text-muted" />
              <span>{bestDay.estimatedDryingDuration} Hrs</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border-muted" />
        <p className="text-text-muted text-sm leading-relaxed">
          {plan.recommendationText}
        </p>
      </div>
      {/* Expandable 4-Day Breakdown List */}
      {isExpanded && (
        <div className="flex flex-col gap-3 mt-1">
          {plan.days.map((day, index) => {
            const isDayOne = index === 0;
            return (
              <div
                key={index}
                className="rounded-lg border border-border-muted p-6 bg-bg flex flex-col gap-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-text font-semibold text-base tracking-wide">
                    DAY {index + 1} ({formatDayLabel(day.date)})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                      Rain Probability
                    </span>
                    <div className="flex items-center gap-1.5 text-text text-sm font-semibold">
                      <PlaceholderIcon className="w-4 h-4 text-text-muted" />
                      <span>{day.rainProbability}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                      Drying Duration
                    </span>
                    <div className="flex items-center gap-1.5 text-text text-sm font-semibold">
                      <PlaceholderIcon className="w-4 h-4 text-text-muted" />
                      <span>{day.estimatedDryingDuration} Hrs</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border-muted" />
                <p className="text-text-muted text-sm leading-relaxed">
                  {day.verdict}
                </p>
                {isDayOne && day.hourlyBreakdown && (
                  <>
                    <div className="border-t border-border-muted" />
                    <div className="flex justify-center">
                      <button
                        onClick={() => setIsHourlyOpen((prev) => !prev)}
                        className="text-xs border border-border-muted px-4 py-2 rounded-md text-text-muted hover:text-text transition-colors bg-bg-light"
                      >
                        {isHourlyOpen
                          ? "Hide Hourly Breakdown"
                          : "View Hourly Breakdown"}
                      </button>
                    </div>
                  </>
                )}
                {isDayOne && isHourlyOpen && (
                  <HourlyForecast hours={day.hourlyBreakdown} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PlannerSection;
