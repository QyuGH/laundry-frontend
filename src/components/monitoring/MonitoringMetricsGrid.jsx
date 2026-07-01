import MonitoringMetricCard from "./MonitoringMetricCard";

/**
 * Organizes and formats the live device status and sensor telemetry into a 2x2 grid.
 *
 * @param {object} props
 * @param {object|null} props.status - The live device status from RTDB.
 * @param {object|null} props.sensors - The live device sensor data from RTDB.
 * @param {boolean} props.isLoading - Loading state for the RTDB subscription.
 * @returns {JSX.Element}
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
    <section className="flex flex-col gap-3">
      <h2 className="text-text font-medium text-sm tracking-wide">
        Live Telemetry
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
