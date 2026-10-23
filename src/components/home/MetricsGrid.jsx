import { useNavigate } from "react-router-dom";
import {
  WifiHigh,
  WifiSlash,
  ThermometerSimple,
  Drop,
  Play,
} from "@phosphor-icons/react";

function getRainHeadline(probability, isLoading, hasError) {
  if (isLoading) return "Checking local forecast";
  if (hasError || probability === undefined || probability === null) {
    return "Forecast unavailable";
  }
  if (probability >= 70) return "Rain likely. Keep laundry indoors.";
  if (probability >= 40) return "Unsettled skies. Monitor drying.";
  if (probability >= 20) return "Passing clouds. Safe outdoors.";
  return "Clear skies. Great drying weather.";
}

function getFormattedEyebrowDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
    .format(new Date())
    .toUpperCase();
}

function MetricsGrid({
  deviceConnection,
  weather,
  locationName,
  hourLabel,
  isWeatherLoading,
  weatherError,
}) {
  const navigate = useNavigate();

  const hasWeather = !isWeatherLoading && weather && !weatherError;
  const rainProb =
    hasWeather && weather.precipitationProbability !== undefined
      ? weather.precipitationProbability
      : null;

  const headline = getRainHeadline(rainProb, isWeatherLoading, weatherError);
  const eyebrowDate = getFormattedEyebrowDate();

  const rainValue = isWeatherLoading
    ? "—"
    : rainProb !== null
      ? `${rainProb}%`
      : "N/A";

  let rainSub = "Forecast unavailable";
  if (rainProb !== null) {
    if (rainProb >= 70) rainSub = "High risk";
    else if (rainProb >= 40) rainSub = "Moderate risk";
    else rainSub = "Low risk";
  }

  const isOnline = deviceConnection === "online";
  const isChecking = deviceConnection === "checking";

  const statusValue = isChecking
    ? "Checking..."
    : isOnline
      ? "Online"
      : "Offline";
  const statusSub = isChecking
    ? "Connecting..."
    : isOnline
      ? "Live connection"
      : "Last-known status";

  const StatusIcon = isOnline ? WifiHigh : WifiSlash;

  const temperatureValue = isWeatherLoading
    ? "—"
    : hasWeather && weather.temperature !== undefined
      ? `${weather.temperature}°C`
      : "N/A";

  let tempSub = "Forecast unavailable";
  if (hasWeather && weather.temperature !== undefined) {
    const t = weather.temperature;
    if (t <= 15) tempSub = "Cool: slow drying";
    else if (t <= 25) tempSub = "Optimal drying temperature";
    else if (t <= 32) tempSub = "Warm: fast drying";
    else tempSub = "Hot: rapid drying";
  }

  const humidityValue = isWeatherLoading
    ? "—"
    : hasWeather && weather.humidity !== undefined
      ? `${weather.humidity}%`
      : "N/A";

  let humiditySub = "Forecast unavailable";
  if (hasWeather && weather.humidity !== undefined) {
    const h = weather.humidity;
    if (h <= 45) humiditySub = "Low: fast drying";
    else if (h <= 65) humiditySub = "Optimal humidity";
    else humiditySub = "High: slow drying";
  }

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-surface p-6 sm:p-8 md:p-10 shadow-card">
      <div className="relative z-10 flex flex-col gap-8">
        {/* Top Hero: Headline & CTA */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex flex-col max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-brand uppercase font-display mb-2">
              {eyebrowDate}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-text tracking-tight leading-tight">
              {headline}
            </h2>
            <p className="text-sm text-text-muted mt-3">
              {!isWeatherLoading && !weatherError && hourLabel ? (
                <>
                  Forecast at {hourLabel} for {locationName || "your area"}
                </>
              ) : (
                <>Live atmospheric telemetry</>
              )}
            </p>
          </div>

          <button
            onClick={() => navigate("/monitoring")}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-brand hover:bg-brand-600 text-white font-medium text-sm transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 shadow-interactive hover:shadow-glow cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Play className="w-4 h-4 fill-white" weight="fill" />
            <span>Start Drying Session</span>
          </button>
        </div>

        {/* Bottom Metrics Strip with Matching Large Typography */}
        <div className="pt-6 border-t border-border/80 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Dominant Rain Metric (Left) */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
              Rain Probability
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-5xl sm:text-6xl font-extrabold font-display text-brand tracking-tight">
                {rainValue}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-text-muted mt-1 font-medium">
              {rainSub}
            </span>
          </div>

          {/* Vertical Divider */}
          <div
            className="hidden lg:block w-px h-20 bg-border"
            aria-hidden="true"
          />

          {/* Secondary Telemetry Strip with 2xl Typography */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* 1. Device Status */}
            <div className="flex items-start gap-3.5">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-md shrink-0 ${
                  isOnline
                    ? "bg-success-soft text-success"
                    : "bg-danger-soft text-danger"
                }`}
              >
                <StatusIcon className="w-5 h-5" weight="bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
                  Device Status
                </span>
                <span className="text-2xl font-bold font-display text-text mt-0.5">
                  {statusValue}
                </span>
                <span className="text-xs text-text-muted mt-0.5 font-medium">
                  {statusSub}
                </span>
              </div>
            </div>

            {/* 2. Temperature */}
            <div className="flex items-start gap-3.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-warning-soft text-warning shrink-0">
                <ThermometerSimple className="w-5 h-5" weight="bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
                  Temperature
                </span>
                <span className="text-2xl font-bold font-display text-text mt-0.5">
                  {temperatureValue}
                </span>
                <span className="text-xs text-text-muted mt-0.5 font-medium">
                  {tempSub}
                </span>
              </div>
            </div>

            {/* 3. Humidity */}
            <div className="flex items-start gap-3.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-brand-soft text-brand shrink-0">
                <Drop className="w-5 h-5" weight="bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
                  Humidity
                </span>
                <span className="text-2xl font-bold font-display text-text mt-0.5">
                  {humidityValue}
                </span>
                <span className="text-xs text-text-muted mt-0.5 font-medium">
                  {humiditySub}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MetricsGrid;
