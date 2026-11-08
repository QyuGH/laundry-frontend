import { Drop, ThermometerSimple, Sun, CloudRain } from "@phosphor-icons/react";

function HourlyForecast({ hours }) {
  if (!Array.isArray(hours) || hours.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 pt-4 border-t border-border">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand font-display">
          Hourly Weather Timeline (7 AM – 5 PM)
        </span>
        <span className="text-[11px] text-text-muted">Lower rain is safer</span>
      </div>

      <div className="hidden md:flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {hours.map((hourObj, index) => {
          const timePart = (hourObj.timestamp || "").slice(11, 16);
          const [hourStr, minuteStr] = timePart.split(":");
          const hourInt = parseInt(hourStr, 10);
          const period = hourInt >= 12 ? "PM" : "AM";
          const displayHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
          const timeLabel = `${displayHour}:${minuteStr || "00"} ${period}`;

          const rainProb = hourObj.precipitationProbability ?? 0;
          const isHighRain = rainProb >= 50;
          const isModerateRain = rainProb >= 25 && rainProb < 50;

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-between min-w-[110px] rounded-lg border border-border bg-surface p-3 transition-all shrink-0 hover:border-border-strong"
            >
              <span className="text-xs font-bold font-display text-text px-2.5 py-0.5 rounded-full bg-surface-raised border border-border">
                {timeLabel}
              </span>

              <div className="my-2.5 flex flex-col items-center gap-1">
                {isHighRain ? (
                  <CloudRain className="w-5 h-5 text-danger" weight="fill" />
                ) : isModerateRain ? (
                  <CloudRain className="w-5 h-5 text-warning" weight="bold" />
                ) : (
                  <Sun className="w-5 h-5 text-brand" weight="bold" />
                )}
                <span className="text-xs font-extrabold text-text">
                  {rainProb}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                  Rain
                </span>
              </div>

              <div className="w-full pt-2 border-t border-border flex items-center justify-around text-[11px] text-text-muted">
                <div className="flex items-center gap-1" title="Temperature">
                  <ThermometerSimple
                    className="w-3.5 h-3.5 text-warning"
                    weight="bold"
                  />
                  <span className="font-semibold text-text">
                    {Math.round(hourObj.temperature)}°
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Humidity">
                  <Drop className="w-3.5 h-3.5 text-info" weight="bold" />
                  <span className="font-semibold text-text">
                    {hourObj.humidity}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex md:hidden flex-col gap-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
        {hours.map((hourObj, index) => {
          const timePart = (hourObj.timestamp || "").slice(11, 16);
          const [hourStr, minuteStr] = timePart.split(":");
          const hourInt = parseInt(hourStr, 10);
          const period = hourInt >= 12 ? "PM" : "AM";
          const displayHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
          const timeLabel = `${displayHour}:${minuteStr || "00"} ${period}`;

          const rainProb = hourObj.precipitationProbability ?? 0;
          const isHighRain = rainProb >= 50;
          const isModerateRain = rainProb >= 25 && rainProb < 50;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface"
            >
              <span className="text-xs font-bold font-display text-text px-2.5 py-0.5 rounded-full bg-surface-raised border border-border min-w-[75px] text-center">
                {timeLabel}
              </span>

              <div className="flex items-center gap-1.5">
                {isHighRain ? (
                  <CloudRain className="w-4 h-4 text-danger" weight="fill" />
                ) : isModerateRain ? (
                  <CloudRain className="w-4 h-4 text-warning" weight="bold" />
                ) : (
                  <Sun className="w-4 h-4 text-brand" weight="bold" />
                )}
                <span className="text-xs font-bold text-text">
                  {rainProb}%{" "}
                  <span className="text-[10px] text-text-muted font-normal">
                    Rain
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-text">
                <div className="flex items-center gap-1" title="Temperature">
                  <ThermometerSimple
                    className="w-3.5 h-3.5 text-warning"
                    weight="bold"
                  />
                  <span className="font-semibold">
                    {Math.round(hourObj.temperature)}°
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Humidity">
                  <Drop className="w-3.5 h-3.5 text-info" weight="bold" />
                  <span className="font-semibold">{hourObj.humidity}%</span>
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
