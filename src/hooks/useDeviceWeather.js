import { useState, useEffect } from "react";
import { getDeviceWeather } from "../services/api";

/**
 * Fetches the current hour's weather forecast from the backend.
 * Parses a display-ready hour label from the ISO timestamp.
 *
 * @returns {{ weather: object|null, hourLabel: string, isLoading: boolean, error: string|null }}
 */
function useDeviceWeather() {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [hourLabel, setHourLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
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
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, locationName, hourLabel, isLoading, error };
}

export default useDeviceWeather;
