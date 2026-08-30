import { useNavigate } from "react-router-dom";
import MetricCard from "./MetricCard";
import {
  WifiHigh,
  WifiSlash,
  CloudRain,
  ThermometerSimple,
  Drop,
} from "@phosphor-icons/react";

/**
 * Displays the Dashboard header and the four-card metrics grid with dynamic icon colors.
 *
 * @param {object} props
 * @param {string} props.deviceConnection - "checking"|"online"|"offline".
 * @param {object|null} props.weather - Weather forecast object.
 * @param {string} props.locationName - Location string.
 * @param {string} props.hourLabel - Formatted forecast hour.
 * @param {boolean} props.isWeatherLoading - Weather loading state.
 * @param {string|null} props.weatherError - Error message.
 * @returns {JSX.Element}
 */
function MetricsGrid({
  deviceConnection,
  weather,
  locationName,
  hourLabel,
  isWeatherLoading,
  weatherError,
}) {
  const navigate = useNavigate();

  // --- 1. Device Status ---
  const isOnline = deviceConnection === "online";
  const isChecking = deviceConnection === "checking";

  const statusValue = isChecking ? "—" : isOnline ? "Online" : "Offline";
  const statusSub = isChecking
    ? "Checking device connection…"
    : isOnline
      ? "Connected — live updates"
      : "Offline — last-known status";

  const StatusIcon = isOnline ? WifiHigh : isChecking ? WifiHigh : WifiSlash;
  const statusColor = isChecking
    ? "text-text-muted"
    : isOnline
      ? "text-success"
      : "text-danger";

  // --- 2. Temperature ---
  const hasWeather = !isWeatherLoading && weather && !weatherError;
  const temperatureValue = isWeatherLoading
    ? "—"
    : hasWeather && weather.temperature !== undefined
      ? `${weather.temperature}°C`
      : "N/A";

  let tempSub = "";
  let tempColor = "text-text-muted";

  if (hasWeather && weather.temperature !== undefined) {
    const t = weather.temperature;
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
  } else if (!isWeatherLoading) {
    tempSub = weatherError || !weather ? "Forecast unavailable" : "";
  }

  // --- 3. Humidity ---
  const humidityValue = isWeatherLoading
    ? "—"
    : hasWeather && weather.humidity !== undefined
      ? `${weather.humidity}%`
      : "N/A";

  let humiditySub = "";
  let humidityColor = "text-text-muted";

  if (hasWeather && weather.humidity !== undefined) {
    const h = weather.humidity;
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
  } else if (!isWeatherLoading) {
    humiditySub = weatherError || !weather ? "Forecast unavailable" : "";
  }

  // --- 4. Rain Probability ---
  const rainValue = isWeatherLoading
    ? "—"
    : hasWeather && weather.precipitationProbability !== undefined
      ? `${weather.precipitationProbability}%`
      : "N/A";

  let rainSub = "";
  let rainColor = "text-text-muted";

  if (hasWeather && weather.precipitationProbability !== undefined) {
    const prob = weather.precipitationProbability;
    if (prob >= 70) {
      rainSub = "High chance of rain";
      rainColor = "text-danger";
    } else if (prob >= 50) {
      rainSub = "Rain might develop";
      rainColor = "text-warning";
    } else if (prob >= 30) {
      rainSub = "Low chances of rain";
      rainColor = "text-info";
    } else {
      rainSub = "Clear skies ahead — good for outdoor drying";
      rainColor = "text-success";
    }
  } else if (!isWeatherLoading) {
    rainSub = weatherError || !weather ? "Forecast unavailable" : "";
  }

  return (
    <section className="flex flex-col gap-block">
      <div className="section-header">
        <div className="flex flex-col gap-1">
          {!isWeatherLoading && !weatherError && hourLabel ? (
            <span className="text-sm text-text-muted">
              Forecast today at {hourLabel} in {locationName}
            </span>
          ) : (
            <span className="text-sm text-text-muted">Overview</span>
          )}
        </div>

        <button
          onClick={() => navigate("/monitoring")}
          className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text hover:cursor-pointer transition-colors duration-150 bg-surface-bg shrink-0"
        >
          Start Session &gt;
        </button>
      </div>

      <div className="stat-grid">
        <MetricCard
          title="Device Status"
          value={statusValue}
          subValue={statusSub}
          icon={StatusIcon}
          iconColor={statusColor}
        />
        <MetricCard
          title="Rain Probability"
          value={rainValue}
          subValue={rainSub}
          icon={CloudRain}
          iconColor={rainColor}
        />
        <MetricCard
          title="Temperature"
          value={temperatureValue}
          subValue={tempSub}
          icon={ThermometerSimple}
          iconColor={tempColor}
        />
        <MetricCard
          title="Humidity"
          value={humidityValue}
          subValue={humiditySub}
          icon={Drop}
          iconColor={humidityColor}
        />
      </div>
    </section>
  );
}

export default MetricsGrid;
