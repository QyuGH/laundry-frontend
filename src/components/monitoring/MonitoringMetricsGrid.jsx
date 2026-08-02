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

  let tempSub = "";
  if (!isLoading && sensors?.temperature !== undefined) {
    const t = sensors.temperature;
    if (t <= 5) tempSub = "Very cold — drying will be slow";
    else if (t <= 15) tempSub = "Cool — slower drying";
    else if (t <= 25) tempSub = "Comfortable — good drying conditions";
    else if (t <= 32) tempSub = "Warm — faster drying";
    else tempSub = "High — avoid overheating delicate fabrics";
  }

  const humidityDisplay =
    isLoading || sensors?.humidity === undefined ? "—" : `${sensors.humidity}%`;

  let humiditySub = "";
  if (!isLoading && sensors?.humidity !== undefined) {
    const h = sensors.humidity;
    if (h <= 30) humiditySub = "Low humidity — fast drying";
    else if (h <= 60) humiditySub = "Optimal humidity for drying";
    else humiditySub = "High humidity — drying slowed";
  }

  return (
    <section className="flex flex-col gap-[var(--gap-block)]">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg sm:text-xl font-semibold text-text">
          Live Telemetry
        </h1>
        <span className="text-sm text-text-muted">
          Device sensor data and control panel
        </span>
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
        <MonitoringMetricCard title="Temperature" value={tempDisplay} subValue={tempSub} />
        <MonitoringMetricCard title="Humidity" value={humidityDisplay} subValue={humiditySub} />
      </div>
    </section>
  );
}

export default MonitoringMetricsGrid;
