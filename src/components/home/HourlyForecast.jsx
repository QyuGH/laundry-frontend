/**
 * Renders a vertical list of hourly weather parameters (7AM to 5PM) for Day 1.
 *
 * @param {object} props
 * @param {Array<object>} props.hours - Day 1 hourly forecast data.
 * @returns {JSX.Element}
 */
function HourlyForecast({ hours }) {
  if (!hours || hours.length === 0) return null;

  return (
    <div className="flex flex-col gap-[var(--gap-block)]">
      <span className="text-xs font-medium tracking-wide text-text">
        Hourly Forecast (7 AM - 5 PM)
      </span>

      <div className="flex flex-col gap-[var(--gap-inline)] max-h-[320px] overflow-y-auto pr-1">
        {hours.map((hourObj, index) => {
          const timePart = hourObj.timestamp.slice(11, 16);
          const [hourStr, minuteStr] = timePart.split(":");
          const hourInt = parseInt(hourStr, 10);
          const period = hourInt >= 12 ? "PM" : "AM";
          const displayHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
          const timeLabel = `${displayHour}:${minuteStr} ${period}`;

          return (
            <div
              key={index}
              className="flex flex-col gap-inline p-4 rounded-lg border border-border-muted bg-bg-dark shrink-0"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-text">
                  {timeLabel}
                </span>
                <span className="text-xs font-semibold text-text">
                  Rain: {hourObj.precipitationProbability}%
                </span>
              </div>

              <div className="border-t border-border-muted/40" />

              <div className="grid grid-cols-2 gap-block">
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    Temp
                  </span>
                  <span className="text-sm font-medium text-text">
                    {hourObj.temperature}°C
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    Humidity
                  </span>
                  <span className="text-sm font-medium text-text">
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
