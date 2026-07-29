import MonitoringMetricCard from "./MonitoringMetricCard";

/**
 * Organizes live device status and sensor telemetry into a 4-card metric grid.
 * Grid columns: 1 (mobile) / 2 (sm) / 4 (xl) via `stat-grid`.
 */
function MonitoringMetricsGrid({ status, sensors, isLoading }) {
  const isOnline = status?.isOnline;
  const motorStatus = status?.motorStatus;
  const pulleyPosition = status?.pulleyPosition;

  let pulleyDisplay = "—";
  let pulleySub = "";

  if (!isLoading) {
    if (!isOnline) {
      pulleyDisplay = "Offline";
    } else if (motorStatus === "moving") {
      pulleyDisplay = "Moving...";
      pulleySub = "In transit";
    } else if (motorStatus === "idle") {
      if (pulleyPosition === "drying-zone") {
        pulleyDisplay = "Deployed";
        pulleySub = "Drying Zone";
      } else if (pulleyPosition === "protected-zone") {
        pulleyDisplay = "Retracted";
        pulleySub = "Protected Zone";
      } else {
        pulleyDisplay = "Unknown";
      }
    }
  }

  const rainDisplay =
    isLoading || !sensors
      ? "—"
      : sensors.rainDetected
        ? "Rain Detected"
        : "Clear";

  const rainSub =
    sensors?.rainValue !== undefined
      ? `Sensor Value: ${sensors.rainValue}`
      : "";

  const tempDisplay =
    isLoading || sensors?.temperature === undefined
      ? "—"
      : `${sensors.temperature}°C`;

  const humidityDisplay =
    isLoading || sensors?.humidity === undefined ? "—" : `${sensors.humidity}%`;

  return (
    <section className="flex flex-col gap-[var(--gap-block)]">
      <div className="section-header">
        <h1 className="text-lg sm:text-xl font-semibold text-text">
          Live Telemetry
        </h1>
      </div>

      <div className="stat-grid">
        <MonitoringMetricCard
          title="Pulley Status"
          value={pulleyDisplay}
          subValue={pulleySub}
        />
        <MonitoringMetricCard
          title="Rain Sensor"
          value={rainDisplay}
          subValue={rainSub}
        />
        <MonitoringMetricCard title="Temperature" value={tempDisplay} />
        <MonitoringMetricCard title="Humidity" value={humidityDisplay} />
      </div>
    </section>
  );
}

export default MonitoringMetricsGrid;
