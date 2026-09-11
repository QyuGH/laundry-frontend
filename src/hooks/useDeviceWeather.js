import { useState, useEffect, useCallback, useRef } from "react";
import { getDeviceWeather } from "../services/api";

/**
 * Fetches the current hour's weather forecast from the backend and keeps it
 * up to date by refetching at the start of each new UTC hour.
 * @returns {{ weather: object|null, locationName: string, hourLabel: string, isLoading: boolean, error: string|null, weatherRefetch: function }}
 */
function useDeviceWeather() {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [hourLabel, setHourLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getDeviceWeather();
      setWeather(response.weather);
      setLocationName(response.locationName);

      const timePart = response.weather.timestamp.slice(11, 16);
      const [hourStr, minuteStr] = timePart.split(":");
      const hour = parseInt(hourStr, 10);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      setHourLabel(`${displayHour}:${minuteStr} ${period}`);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();

    const now = new Date();
    const msUntilNextHour =
      (60 - now.getUTCMinutes()) * 60 * 1000 -
      now.getUTCSeconds() * 1000 -
      now.getUTCMilliseconds();

    timeoutRef.current = setTimeout(() => {
      fetchWeather();
      intervalRef.current = setInterval(fetchWeather, 60 * 60 * 1000);
    }, msUntilNextHour);

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, [fetchWeather]);

  return {
    weather,
    locationName,
    hourLabel,
    isLoading,
    error,
    weatherRefetch: fetchWeather,
  };
}

export default useDeviceWeather;
