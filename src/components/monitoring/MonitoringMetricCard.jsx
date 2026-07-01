import PlaceholderIcon from "../icons/PlaceholderIcon";

/**
 * Renders a single metric reading with a title, value, and status indicator.
 *
 * @param {object} props
 * @param {string} props.title - The title label of the metric.
 * @param {string|number} props.value - The main value to display.
 * @param {string} [props.subValue] - Optional secondary descriptive text.
 * @returns {JSX.Element}
 */
function MonitoringMetricCard({ title, value, subValue }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-border-muted bg-glass-card">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest font-medium">
          {title}
        </span>
        <PlaceholderIcon className="w-4 h-4 text-text-muted" />
      </div>
      <div className="flex flex-col">
        <span className="text-text text-2xl font-semibold tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="text-text-muted text-xs mt-1">{subValue}</span>
        )}
      </div>
    </div>
  );
}

export default MonitoringMetricCard;
