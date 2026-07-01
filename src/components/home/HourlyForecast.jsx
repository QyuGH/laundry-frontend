/**
 * Renders a vertical list of hourly weather parameters (7AM to 5PM) for Day 1.
 * Matches design with Time and Highlighted Rain at the top, and Temp/Humidity details below.
 *
 * @param {object} props
 * @param {Array<object>} props.hours - Day 1 hourly forecast data.
 * @returns {JSX.Element}
 */
function HourlyForecast({ hours }) {
  if (!hours || hours.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-3 border-t border-border-muted pt-4">
      <span className="text-text font-medium text-xs tracking-wide">
        Hourly Forecast (7 AM - 5 PM)
      </span>

      <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
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
              className="flex flex-col p-4 rounded-lg border border-border-muted bg-bg-dark gap-2 shrink-0"
            >
              {/* Row 1: Time and Highlighted Rain */}
              <div className="flex justify-between items-center">
                <span className="text-text text-sm font-semibold">
                  {timeLabel}
                </span>
                <span className="text-text text-xs font-semibold">
                  Rain: {hourObj.precipitationProbability}%
                </span>
              </div>

              <div className="border-t border-border-muted/40 my-0.5" />

              {/* Row 2: Metric labels and values */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    Temp
                  </span>
                  <span className="text-text text-sm font-medium">
                    {hourObj.temperature}°C
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    Humidity
                  </span>
                  <span className="text-text text-sm font-medium">
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
