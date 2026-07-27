import PlaceholderIcon from "../icons/PlaceholderIcon";

/**
 * Shared layout for the Planner's Recommendation and Day breakdown cards:
 * a header label, a rain probability / drying duration pair, a divider,
 * and a body paragraph. Optional children render below the paragraph
 * (used for Day 1's hourly forecast toggle and breakdown).
 *
 * Border and background intentionally differ by `emphasized` to preserve
 * the existing visual distinction between the primary Recommendation card
 * and the secondary Day breakdown cards — a styling choice, not a
 * structural one.
 *
 * @param {object} props
 * @param {string} props.label - Header label .
 * @param {number} props.rainProbability
 * @param {number} props.estimatedDryingDuration
 * @param {string} props.bodyText - Recommendation text or day verdict.
 * @param {boolean} [props.emphasized=false] - True for the Recommendation card.
 * @param {React.ReactNode} [props.children]
 * @returns {JSX.Element}
 */
function ForecastDayCard({
  label,
  rainProbability,
  estimatedDryingDuration,
  bodyText,
  emphasized = false,
  children,
}) {
  return (
    <div
      className={`rounded-lg flex flex-col gap-[var(--gap-block)] p-[var(--card-padding-mobile)] sm:p-[var(--card-padding-sm)] lg:p-[var(--card-padding-lg)] ${
        emphasized
          ? "border border-border bg-glass-card"
          : "border border-border-muted bg-bg"
      }`}
    >
      <span className="text-base font-semibold tracking-wide text-text">
        {label}
      </span>

      <div className="grid grid-cols-2 gap-[var(--gap-block)]">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
            Rain Probability
          </span>
          <div className="flex items-center gap-[var(--gap-inline)] text-sm font-semibold text-text">
            <PlaceholderIcon className="w-4 h-4 text-text-muted" />
            <span>{rainProbability}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
            Drying Duration
          </span>
          <div className="flex items-center gap-[var(--gap-inline)] text-sm font-semibold text-text">
            <PlaceholderIcon className="w-4 h-4 text-text-muted" />
            <span>{estimatedDryingDuration} Hrs</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border-muted" />

      <p className="text-sm leading-relaxed text-text-muted">{bodyText}</p>

      {children}
    </div>
  );
}

export default ForecastDayCard;
