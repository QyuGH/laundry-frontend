import {
  RainIcon,
  TemperatureIcon,
  HumidityIcon,
  MotorIcon,
} from "../icons/MetricIcons";

/**
 * Renders a single telemetry metric card using standard card-shell styling.
 */
function MonitoringMetricCard({ title, value, subValue }) {
  return (
    <div className="card-shell flex flex-col gap-stack">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted uppercase tracking-widest">
          {title}
        </span>
        {title === "Rain Sensor" && (
          <RainIcon className="w-4 h-4 text-text-muted" />
        )}
        {title === "Temperature" && (
          <TemperatureIcon className="w-4 h-4 text-text-muted" />
        )}
        {title === "Humidity" && (
          <HumidityIcon className="w-4 h-4 text-text-muted" />
        )}
        {title === "Pulley Status" && (
          <MotorIcon className="w-4 h-4 text-text-muted" />
        )}
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
