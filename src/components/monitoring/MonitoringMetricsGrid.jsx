import MonitoringMetricCard from "./MonitoringMetricCard";
import { MotorIcon } from "../icons/MetricIcons";
import { CloudRain, ThermometerSimple, Drop } from "@phosphor-icons/react";

/**
 * Organizes live device status and sensor telemetry into a 4-card metric grid with dynamic icon colors.
 */
function MonitoringMetricsGrid({ status, sensors, isLoading }) {
  const isOnline = status?.isOnline;
  const motorStatus = status?.motorStatus;
  const pulleyPosition = status?.pulleyPosition;

  // --- 1. Pulley Status ---
  let pulleyDisplay = "—";
  let pulleySub = "";
  let pulleyColor = "text-text-muted";

  if (!isLoading) {
    if (!isOnline) {
      pulleyDisplay = "Offline";
      pulleyColor = "text-danger";
    } else if (motorStatus === "moving") {
      pulleyDisplay = "Moving...";
      pulleySub = "In transit";
      pulleyColor = "text-warning";
    } else if (motorStatus === "idle") {
      if (pulleyPosition === "drying-zone") {
        pulleyDisplay = "Deployed";
        pulleySub = "Drying Zone";
        pulleyColor = "text-success";
      } else if (pulleyPosition === "protected-zone") {
        pulleyDisplay = "Retracted";
        pulleySub = "Protected Zone";
        pulleyColor = "text-accent";
      } else {
        pulleyDisplay = "Unknown";
      }
    }
  }

  // --- 2. Rain Sensor (Binary) ---
  const rainDetected = sensors?.rainDetected;
  const rainDisplay =
    isLoading || !sensors ? "—" : rainDetected ? "Rain Detected" : "Clear";

  const rainSub =
    sensors?.rainValue !== undefined
      ? `Sensor Value: ${sensors.rainValue}`
      : "";

  const rainColor =
    isLoading || !sensors
      ? "text-text-muted"
      : rainDetected
        ? "text-danger"
        : "text-success";

  // --- 3. Temperature ---
  const tempDisplay =
    isLoading || sensors?.temperature === undefined
      ? "—"
      : `${sensors.temperature}°C`;

  let tempSub = "";
  let tempColor = "text-text-muted";

  if (!isLoading && sensors?.temperature !== undefined) {
    const t = sensors.temperature;
    if (t <= 5) {
      tempSub = "Very cold — drying will be slow";
      tempColor = "text-info";
    } else if (t <= 15) {
      tempSub = "Cool — slower drying";
      tempColor = "text-info";
    } else if (t <= 25) {
      tempSub = "Comfortable — good drying conditions";
      tempColor = "text-success";
    } else if (t <= 32) {
      tempSub = "Warm — faster drying";
      tempColor = "text-warning";
    } else {
      tempSub = "High — avoid overheating delicate fabrics";
      tempColor = "text-danger";
    }
  }

  // --- 4. Humidity ---
  const humidityDisplay =
    isLoading || sensors?.humidity === undefined ? "—" : `${sensors.humidity}%`;

  let humiditySub = "";
  let humidityColor = "text-text-muted";

  if (!isLoading && sensors?.humidity !== undefined) {
    const h = sensors.humidity;
    if (h <= 30) {
      humiditySub = "Low humidity — fast drying";
      humidityColor = "text-info";
    } else if (h <= 60) {
      humiditySub = "Optimal humidity for drying";
      humidityColor = "text-success";
    } else {
      humiditySub = "High humidity — drying slowed";
      humidityColor = "text-warning";
    }
  }

  return (
    <section className="flex flex-col gap-block">
      <div className="flex flex-col gap-1">
        <div className="section-header">
          <span className="text-sm text-text-muted">
            Device sensor data and control panel
          </span>
        </div>
      </div>

      <div className="stat-grid">
        <MonitoringMetricCard
          title="Pulley Status"
          value={pulleyDisplay}
          subValue={pulleySub}
          icon={MotorIcon}
          iconColor={pulleyColor}
        />
        <MonitoringMetricCard
          title="Rain Sensor"
          value={rainDisplay}
          subValue={rainSub}
          icon={CloudRain}
          iconColor={rainColor}
        />
        <MonitoringMetricCard
          title="Temperature"
          value={tempDisplay}
          subValue={tempSub}
          icon={ThermometerSimple}
          iconColor={tempColor}
        />
        <MonitoringMetricCard
          title="Humidity"
          value={humidityDisplay}
          subValue={humiditySub}
          icon={Drop}
          iconColor={humidityColor}
        />
      </div>
    </section>
  );
}

export default MonitoringMetricsGrid;
