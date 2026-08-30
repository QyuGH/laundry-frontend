/**
 * Displays a single telemetry metric card in the Monitoring view.
 *
 * @param {object} props
 * @param {string} props.title - Metric title.
 * @param {string} props.value - Value string.
 * @param {string} [props.subValue] - Status explanation.
 * @param {React.ComponentType} [props.icon] - Icon component.
 * @param {string} [props.iconColor] - Tailwind color class for the icon.
 * @returns {JSX.Element}
 */
function MonitoringMetricCard({
  title,
  value,
  subValue,
  icon: IconComponent,
  iconColor = "text-text-muted",
}) {
  return (
    <div className="card-shell flex flex-col gap-stack">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted uppercase tracking-widest">
          {title}
        </span>
        {IconComponent && (
          <IconComponent className={`w-5 h-5 shrink-0 ${iconColor}`} />
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
