import PlaceholderIcon from "../icons/PlaceholderIcon";

/**
 * Renders a single telemetry metric card using standard card-shell styling.
 */
function MonitoringMetricCard({ title, value, subValue }) {
  return (
    <div className="card-shell flex flex-col gap-[var(--gap-stack)]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted uppercase tracking-widest">
          {title}
        </span>
        <PlaceholderIcon className="w-4 h-4 text-text-muted" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-semibold tracking-tight text-text">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-text-muted mt-1">{subValue}</span>
        )}
      </div>
    </div>
  );
}

export default MonitoringMetricCard;
