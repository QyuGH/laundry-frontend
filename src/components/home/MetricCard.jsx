import {
  DeviceStatusIcon,
  RainIcon,
  TemperatureIcon,
  HumidityIcon,
  PulleyStatusIcon,
  ClockIcon,
} from "../icons/MetricIcons";

/**
 * Displays a single metric with a label, placeholder icon, and formatted value.
 * Used in the metrics grid on the Home page.
 *
 * @param {object} props
 * @param {string} props.title - The metric label (e.g. "Temperature").
 * @param {string} props.value - The formatted value string to display (e.g. "32°C").
 * @returns {JSX.Element}
 */
function MetricCard({ title, value, subValue }) {
  return (
    <div className="card-shell flex flex-col gap-[var(--gap-stack)]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted uppercase tracking-widest">
          {title}
        </span>
        {title === "Device Status" && (
          <DeviceStatusIcon className="w-4 h-4 text-text-muted" />
        )}
        {title === "Rain Probability" && (
          <RainIcon className="w-4 h-4 text-text-muted" />
        )}
        {title === "Temperature" && (
          <TemperatureIcon className="w-4 h-4 text-text-muted" />
        )}
        {title === "Humidity" && (
          <HumidityIcon className="w-4 h-4 text-text-muted" />
        )}
        {title === "Pulley Status" && (
          <PulleyStatusIcon className="w-4 h-4 text-text-muted" />
        )}
        {title === "Clock" && <ClockIcon className="w-4 h-4 text-text-muted" />}
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

export default MetricCard;
