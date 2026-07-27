import { useNavigate } from "react-router-dom";
import MetricCard from "./MetricCard";

/**
 * Displays the Dashboard header (title, forecast subtitle, Start Session
 * action) and the four-card metrics grid.
 * Grid columns: 1 (mobile) / 2 (sm) / 4 (xl) via `stat-grid`.
 *
 * @param {object} props
 * @param {string} props.deviceConnection - "checking"|"online"|"offline".
 * @param {object|null} props.weather - Weather forecast object from the backend.
 * @param {string} props.locationName - Human-readable device location.
 * @param {string} props.hourLabel - Human-readable forecast hour (e.g. "8:00 AM").
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
    <section className="flex flex-col gap-[var(--gap-block)] ">
      <div className="section-header">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-semibold text-text">
            Dashboard
          </h1>
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
          className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text transition-colors duration-150 bg-bg shrink-0"
        >
          Start Session &gt;
        </button>
      </div>

      <div className="stat-grid">
        <MetricCard title="Device Status" value={statusValue} />
        <MetricCard title="Rain Probability" value={rainValue} />
        <MetricCard title="Temperature" value={temperatureValue} />
        <MetricCard title="Humidity" value={humidityValue} />
      </div>
    </section>
  );
}

export default MetricsGrid;
