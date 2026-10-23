import { CloudRain, ThermometerSimple, Drop, Sun } from "@phosphor-icons/react";

function getHeroHeadline(isOnline, fault, motorStatus, pulleyPosition) {
  if (!isOnline) return "Device offline or connection lost.";
  if (fault && fault !== "NONE") return "Motor alert detected on rack.";
  if (motorStatus === "moving") return "Clothes rack is in motion...";
  if (pulleyPosition === "drying-zone")
    return "Your line is outside and drying.";
  if (pulleyPosition === "protected-zone")
    return "Clothes rack retracted indoors.";
  return "Monitoring device telemetry.";
}

function MonitoringMetricsGrid({ status, sensors, isLoading }) {
  const isOnline = status?.isOnline;
  const motorStatus = status?.motorStatus;
  const pulleyPosition = status?.pulleyPosition;
  const fault = status?.fault;

  let pulleyDisplay = "—";
  let pulleySub = "Indoor zone";
  let isDeployed = false;

  if (!isLoading) {
    if (!isOnline) {
      pulleyDisplay = "Offline";
      pulleySub = "Disconnected";
    } else if (fault && fault !== "NONE") {
      pulleyDisplay = "Fault";
      pulleySub = "Limit switch error";
    } else if (motorStatus === "moving") {
      pulleyDisplay = "Moving...";
      pulleySub = "In transit";
      isDeployed = true;
    } else if (pulleyPosition === "drying-zone") {
      pulleyDisplay = "Deployed";
      pulleySub = "Drying zone";
      isDeployed = true;
    } else if (pulleyPosition === "protected-zone") {
      pulleyDisplay = "Retracted";
      pulleySub = "Indoor zone";
      isDeployed = false;
    } else {
      pulleyDisplay = "Unknown";
      pulleySub = "Awaiting signal";
    }
  }

  const headline = getHeroHeadline(
    isOnline,
    fault,
    motorStatus,
    pulleyPosition,
  );

  const rainDetected = sensors?.rainDetected;
  const rainDisplay =
    isLoading || !sensors ? "—" : rainDetected ? "Rain Detected" : "Clear";
  const rainSub = rainDetected ? "High moisture" : "Safe for drying";

  const tempDisplay =
    isLoading || sensors?.temperature === undefined
      ? "—"
      : `${sensors.temperature}°C`;

  let tempSub = "Sensor unavailable";
  if (!isLoading && sensors?.temperature !== undefined) {
    const t = sensors.temperature;
    if (t <= 15) tempSub = "Cool: slow drying";
    else if (t <= 25) tempSub = "Optimal drying temperature";
    else if (t <= 32) tempSub = "Warm: fast drying";
    else tempSub = "Hot: rapid drying";
  }

  const humidityDisplay =
    isLoading || sensors?.humidity === undefined ? "—" : `${sensors.humidity}%`;

  let humiditySub = "Sensor unavailable";
  if (!isLoading && sensors?.humidity !== undefined) {
    const h = sensors.humidity;
    if (h <= 45) humiditySub = "Low: fast drying";
    else if (h <= 65) humiditySub = "Optimal humidity";
    else humiditySub = "High: slow drying";
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Independent Headline Area on Canvas */}
      <div className="flex flex-col max-w-2xl">
        <span className="text-xs font-bold tracking-widest text-brand uppercase font-display mb-1.5">
          Live From Device
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-text tracking-tight leading-tight">
          {headline}
        </h2>
        <p className="text-sm text-text-muted mt-2">
          Device sensor data and control panel
        </p>
      </div>

      {/* 2. Standalone Grouped Metrics Card with Dividers */}
      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Pulley Status */}
          <div className="flex flex-col justify-between pb-5 sm:pb-0 sm:pr-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
                Pulley Status
              </span>
              <div
                className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors ${
                  isDeployed
                    ? "bg-brand justify-end"
                    : "bg-neutral-300 dark:bg-neutral-700 justify-start"
                }`}
                aria-hidden="true"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>
            <div className="mt-3 flex flex-col">
              <span className="text-2xl font-bold font-display text-text">
                {pulleyDisplay}
              </span>
              <span className="text-xs text-text-muted mt-0.5 font-medium">
                {pulleySub}
              </span>
            </div>
          </div>

          {/* Rain Sensor */}
          <div className="flex items-start gap-3.5 py-5 sm:py-0 sm:px-6">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-md shrink-0 ${
                rainDetected
                  ? "bg-danger-soft text-danger"
                  : "bg-brand-soft text-brand"
              }`}
            >
              {rainDetected ? (
                <CloudRain className="w-5 h-5" weight="fill" />
              ) : (
                <Sun className="w-5 h-5" weight="bold" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
                Rain Sensor
              </span>
              <span className="text-2xl font-bold font-display text-text mt-0.5">
                {rainDisplay}
              </span>
              <span className="text-xs text-text-muted mt-0.5 font-medium">
                {rainSub}
              </span>
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-start gap-3.5 py-5 sm:py-0 sm:px-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-warning-soft text-warning shrink-0">
              <ThermometerSimple className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
                Temperature
              </span>
              <span className="text-2xl font-bold font-display text-text mt-0.5">
                {tempDisplay}
              </span>
              <span className="text-xs text-text-muted mt-0.5 font-medium">
                {tempSub}
              </span>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-start gap-3.5 pt-5 sm:pt-0 sm:pl-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-brand-soft text-brand shrink-0">
              <Drop className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
                Humidity
              </span>
              <span className="text-2xl font-bold font-display text-text mt-0.5">
                {humidityDisplay}
              </span>
              <span className="text-xs text-text-muted mt-0.5 font-medium">
                {humiditySub}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MonitoringMetricsGrid;
