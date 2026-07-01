import PlaceholderIcon from "../icons/PlaceholderIcon";

/**
 * Displays a single metric with a label, placeholder icon, and formatted value.
 * Used in the metrics grid on the Home page.
 *
 * @param {object} props
 * @param {string} props.title - The metric label (e.g. "Temperature").
 * @param {string} props.value - The formatted value string to display (e.g. "32°C").
 * @returns {JSX.Element}
 */
function MetricCard({ title, value }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-border-muted bg-glass-card">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest">
          {title}
        </span>
        <PlaceholderIcon className="w-4 h-4 text-text-muted" />
      </div>
      <span className="text-text text-2xl font-semibold tracking-tight">
        {value}
      </span>
    </div>
  );
}

export default MetricCard;
