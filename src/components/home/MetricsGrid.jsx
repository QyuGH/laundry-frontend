import { useNavigate } from "react-router-dom";
import MetricCard from "./MetricCard";
/**
 * Displays the four metrics cards in a responsive grid with a group header.
 * Grid is single-column on mobile (< sm) and 2x2 on sm and above.
 *
 * Layout order:
 *   Row 1: Device Status | Rain Probability
 *   Row 2: Temperature   | Humidity
 *
 * @param {object} props
 * @param {string} props.deviceConnection - Passive connection state: "checking"|"online"|"offline".
 * @param {object|null} props.weather - Weather forecast object from the backend.
 * @param {string} props.hourLabel - Human-readable label for the forecast hour (e.g. "8:00 AM").
 * @param {boolean} props.isWeatherLoading - Whether the weather fetch is in progress.
 * @param {string|null} props.weatherError - Error message if the weather fetch failed.
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

  const statusValue =
    deviceConnection === "checking"
      ? "—"
      : deviceConnection === "online"
        ? "Online"
        : "Offline";

  const temperatureValue = isWeatherLoading
    ? "—"
    : weatherError || !weather
      ? "N/A"
      : `${weather.temperature}°C`;

  const humidityValue = isWeatherLoading
    ? "—"
    : weatherError || !weather
      ? "N/A"
      : `${weather.humidity}%`;

  const rainValue = isWeatherLoading
    ? "—"
    : weatherError || !weather
      ? "N/A"
      : `${weather.precipitationProbability}%`;

  return (
    <section>
      {/* Top Header Block: Combines title metadata and Start Session desktop CTA */}
      <div className="flex items-center justify-between gap-4 mb-3 min-h-[38px]">
        {/* Forecast Details (Left side) */}
        {!isWeatherLoading && !weatherError && hourLabel ? (
          <span className="text-text font-medium text-sm tracking-wide">
            Forecast today at {hourLabel} in {locationName}
          </span>
        ) : (
          <span className="text-text font-medium text-sm tracking-wide">
            Overview
          </span>
        )}

        {/* Start Session CTA (Desktop only, hidden on mobile) */}
        <button
          onClick={() => navigate("/monitoring")}
          className="hidden md:block text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text transition-colors duration-150 bg-bg"
        >
          Start Session &gt;
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricCard title="Device Status" value={statusValue} />
        <MetricCard title="Rain Probability" value={rainValue} />
        <MetricCard title="Temperature" value={temperatureValue} />
        <MetricCard title="Humidity" value={humidityValue} />
      </div>
    </section>
  );
}

export default MetricsGrid;
