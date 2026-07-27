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
    <div className="card-shell flex flex-col gap-[var(--gap-stack)]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted uppercase tracking-widest">
          {title}
        </span>
        <PlaceholderIcon className="w-4 h-4 text-text-muted" />
      </div>
      <span className="text-xl font-semibold tracking-tight text-text">
        {value}
      </span>
    </div>
  );
}

export default MetricCard;
