import { Drop, ThermometerSimple, Sun, CloudRain } from "@phosphor-icons/react";

function HourlyForecast({ hours }) {
  if (!hours || hours.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 pt-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-brand font-display">
          Hourly Weather Timeline (7 AM – 5 PM)
        </span>
        <span className="text-[11px] text-text-muted">
          Scroll horizontally to view all hours
        </span>
      </div>

      {/* Horizontal Scrubber */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {hours.map((hourObj, index) => {
          const timePart = hourObj.timestamp.slice(11, 16);
          const [hourStr, minuteStr] = timePart.split(":");
          const hourInt = parseInt(hourStr, 10);
          const period = hourInt >= 12 ? "PM" : "AM";
          const displayHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
          const timeLabel = `${displayHour}:${minuteStr} ${period}`;

          const rainProb = hourObj.precipitationProbability ?? 0;
          const isHighRain = rainProb >= 50;
          const isModerateRain = rainProb >= 25 && rainProb < 50;

          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-between min-w-[108px] rounded-lg border p-3 transition-all shrink-0 ${
                isHighRain
                  ? "border-danger-border bg-danger-soft/30"
                  : isModerateRain
                    ? "border-warning-border bg-warning-soft/30"
                    : "border-border bg-canvas hover:border-brand-soft"
              }`}
            >
              {/* Distinct Time Badge */}
              <span className="text-xs font-bold font-display text-text px-2 py-0.5 rounded-full bg-surface border border-border">
                {timeLabel}
              </span>

              {/* Rain Risk Indicator */}
              <div className="my-2.5 flex flex-col items-center gap-1">
                {isHighRain ? (
                  <CloudRain className="w-5 h-5 text-danger" weight="fill" />
                ) : isModerateRain ? (
                  <CloudRain className="w-5 h-5 text-warning" weight="bold" />
                ) : (
                  <Sun className="w-5 h-5 text-brand" weight="bold" />
                )}
                <span
                  className={`text-xs font-extrabold ${
                    isHighRain
                      ? "text-danger"
                      : isModerateRain
                        ? "text-warning"
                        : "text-text"
                  }`}
                >
                  {rainProb}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                  Rain
                </span>
              </div>

              {/* Temp & Humidity Micro-Metrics */}
              <div className="w-full pt-2 border-t border-border flex items-center justify-around text-[11px] text-text-muted">
                <div className="flex items-center gap-0.5" title="Temperature">
                  <ThermometerSimple className="w-3.5 h-3.5 text-warning" />
                  <span className="font-semibold text-text">
                    {Math.round(hourObj.temperature)}°
                  </span>
                </div>
                <div className="flex items-center gap-0.5" title="Humidity">
                  <Drop className="w-3.5 h-3.5 text-brand" />
                  <span className="font-semibold text-text">
                    {hourObj.humidity}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HourlyForecast;
