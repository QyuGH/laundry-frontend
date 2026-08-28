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

  let statusSub = "";
  if (deviceConnection === "checking")
    statusSub = "Checking device connection…";
  else if (deviceConnection === "online")
    statusSub = "Connected — live updates";
  else statusSub = "Offline — last-known status";

  const temperatureValue = isWeatherLoading
    ? "—"
    : weatherError || !weather
      ? "N/A"
      : `${weather.temperature}°C`;

  let tempSub = "";
  if (
    !isWeatherLoading &&
    weather &&
    !weatherError &&
    weather.temperature !== undefined
  ) {
    const t = weather.temperature;
    if (t <= 5) tempSub = "Very cold — drying will be slow";
    else if (t <= 15) tempSub = "Cool — slower drying";
    else if (t <= 25) tempSub = "Comfortable — good drying conditions";
    else if (t <= 32) tempSub = "Warm — faster drying";
    else tempSub = "High — avoid overheating delicate fabrics";
  } else if (isWeatherLoading) tempSub = "";
  else tempSub = weatherError || !weather ? "Forecast unavailable" : "";

  const humidityValue = isWeatherLoading
    ? "—"
    : weatherError || !weather
      ? "N/A"
      : `${weather.humidity}%`;

  let humiditySub = "";
  if (
    !isWeatherLoading &&
    weather &&
    !weatherError &&
    weather.humidity !== undefined
  ) {
    const h = weather.humidity;
    if (h <= 30) humiditySub = "Low humidity — fast drying";
    else if (h <= 60) humiditySub = "Optimal humidity for drying";
    else humiditySub = "High humidity — drying slowed";
  } else if (isWeatherLoading) humiditySub = "";
  else humiditySub = weatherError || !weather ? "Forecast unavailable" : "";

  const rainValue = isWeatherLoading
    ? "—"
    : weatherError || !weather
      ? "N/A"
      : `${weather.precipitationProbability}%`;

  let rainSub = "";
  if (
    !isWeatherLoading &&
    weather &&
    !weatherError &&
    weather.precipitationProbability !== undefined
  ) {
    const prob = weather.precipitationProbability;

    if (prob >= 70) {
      rainSub = "High chance of rain";
    } else if (prob >= 50) {
      rainSub = "Rain might develop";
    } else if (prob >= 30) {
      rainSub = "Low chances of rain";
    } else {
      rainSub = "Clear skies ahead — good for outdoor drying";
    }
  } else if (isWeatherLoading) {
    rainSub = "";
  } else {
    rainSub = weatherError || !weather ? "Forecast unavailable" : "";
  }

  return (
    <section className="flex flex-col gap-block">
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
          className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text transition-colors duration-150 bg-surface-bg shrink-0"
        >
          Start Session &gt;
        </button>
      </div>

      <div className="stat-grid">
        <MetricCard
          title="Device Status"
          value={statusValue}
          subValue={statusSub}
        />
        <MetricCard
          title="Rain Probability"
          value={rainValue}
          subValue={rainSub}
        />
        <MetricCard
          title="Temperature"
          value={temperatureValue}
          subValue={tempSub}
        />
        <MetricCard
          title="Humidity"
          value={humidityValue}
          subValue={humiditySub}
        />
      </div>
    </section>
  );
}

export default MetricsGrid;
