import { useState } from "react";
import HourlyForecast from "./HourlyForecast";
import ForecastDayCard from "./ForecastDayCard";

/**
 * Formats an ISO date string as a long weekday/month/day label.
 *
 * @param {string} dateStr
 * @returns {string}
 */
const formatDayLabel = (dateStr) => {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats an ISO date string as a short month/day label.
 *
 * @param {string} dateStr
 * @returns {string}
 */
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
 * @param {boolean} props.isExpired
 * @param {boolean} props.showLocationButton
 * @param {function} props.onChangeLocationClick
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
      <div className="card-shell flex flex-col gap-block">
        <div className="section-header pb-2 border-b border-border-muted">
          <h2 className="text-sm font-medium text-text">Laundry Planner</h2>
        </div>
        <div className="flex flex-col items-center text-center gap-block py-4">
          {isExpired ? (
            <p className="text-sm text-text-muted max-w-xs">
              Your last generated plan expired at{" "}
              {formatExpiryLabel(plan?.expiresAt)}. Generate a new plan to get a
              newer personalized plan!
            </p>
          ) : (
            <p className="text-sm text-text-muted max-w-xs">
              Generate an automated laundry day plan using real-time Open-Meteo
              forecasts rephrased by AI.
            </p>
          )}
          <div className="flex gap-inline">
            {plan && showLocationButton && (
              <button
                onClick={onChangeLocationClick}
                className="px-4 py-2 border border-border rounded-md text-xs font-medium text-text hover:bg-surface-bg transition-colors duration-150"
              >
                Change Location
              </button>
            )}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-surface-bg border border-border rounded-md text-xs font-medium text-text hover:bg-canvas-bg transition-colors duration-150 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Plan"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bestDay = plan.days[plan.bestDayIndex];

  return (
    <div className="card-shell flex flex-col gap-block">
      {/* Integrated Header Row */}
      <div className="section-header pb-2 border-b border-border-muted">
        <h2 className="text-sm font-medium text-text">Laundry Planner</h2>
        <div className="flex gap-inline">
          {showLocationButton && (
            <button
              onClick={onChangeLocationClick}
              className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text transition-colors duration-150 bg-surface-bg"
            >
              Change Location
            </button>
          )}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text transition-colors duration-150 bg-surface-bg"
          >
            {isExpanded ? "Collapse" : "Expand Plan"}
          </button>
        </div>
      </div>

      {/* Main Plan Card Content */}
      <ForecastDayCard
        label={`RECOMMENDATION (${formatDayLabel(bestDay.date)})`}
        rainProbability={bestDay.rainProbability}
        estimatedDryingDuration={bestDay.estimatedDryingDuration}
        bodyText={plan.recommendationText}
        emphasized
      />

      {isExpanded && (
        <div className="flex flex-col gap-block">
          {plan.days.map((day, index) => {
            const isDayOne = index === 0;
            return (
              <ForecastDayCard
                key={index}
                label={`DAY ${index + 1} (${formatDayLabel(day.date)})`}
                rainProbability={day.rainProbability}
                estimatedDryingDuration={day.estimatedDryingDuration}
                bodyText={day.verdict}
              >
                {isDayOne && day.hourlyBreakdown && (
                  <>
                    <div className="border-t border-border-muted" />
                    <div className="flex justify-center">
                      <button
                        onClick={() => setIsHourlyOpen((prev) => !prev)}
                        className="text-xs border border-border-muted px-4 py-2 rounded-md text-text-muted hover:text-text transition-colors bg-surface-bg"
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
              </ForecastDayCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PlannerSection;
