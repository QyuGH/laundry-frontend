import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useRtdbListener from "../hooks/useRtdbListener";
import useDeviceWeather from "../hooks/useDeviceWeather";
import useDeviceConnection from "../hooks/useDeviceConnection";
import MetricsGrid from "../components/home/MetricsGrid";
import PlannerSection from "../components/home/PlannerSection";
import RecentActivity from "../components/home/RecentActivity";
import LocationModal from "../components/home/LocationModal";
import {
  getPlan,
  generatePlan,
  updateDeviceLocation,
  getDeviceLogs,
} from "../services/api";

function HomePage() {
  const { claims } = useAuth();
  const deviceId = claims?.deviceId ?? null;
  const hasDeviceAccess = !!claims?.deviceId;

  const [plan, setPlan] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  const {
    weather,
    locationName,
    hourLabel,
    isLoading: isWeatherLoading,
    error: weatherError,
    weatherRefetch,
  } = useDeviceWeather();

  const { data: rtdbStatus } = useRtdbListener(
    deviceId ? `devices/${deviceId}/status` : null,
  );

  const deviceConnection = useDeviceConnection(rtdbStatus);

  useEffect(() => {
    const fetchSavedPlan = async () => {
      try {
        const savedPlan = await getPlan();
        if (savedPlan) {
          setPlan(savedPlan);
          if (savedPlan.expiresAt) {
            const expiryTime = new Date(savedPlan.expiresAt).getTime();
            const nowTime = new Date().getTime();
            setIsExpired(nowTime > expiryTime);
          }
        }
      } catch (err) {
        // Quietly fail
      }
    };
    fetchSavedPlan();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!deviceId) return;
      try {
        const response = await getDeviceLogs(15);
        if (response && response.logs) {
          setRecentLogs(response.logs);
        }
      } catch (err) {
        // Quietly fail
      } finally {
        setIsLogsLoading(false);
      }
    };
    fetchLogs();
  }, [deviceId]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await generatePlan();
      setPlan(response);
      setIsExpired(false);
    } catch (err) {
      // Quietly handle
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLocation = async (locationData) => {
    await updateDeviceLocation(locationData);
    if (weatherRefetch) {
      await weatherRefetch();
    }
    setIsGenerating(true);
    try {
      const response = await generatePlan();
      setPlan(response);
      setIsExpired(false);
    } catch (err) {
      // Quietly handle
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="section-stack">
      <MetricsGrid
        deviceConnection={deviceConnection}
        weather={weather}
        locationName={locationName}
        hourLabel={hourLabel}
        isWeatherLoading={isWeatherLoading}
        weatherError={weatherError}
      />

      <PlannerSection
        plan={plan}
        isGenerating={isGenerating}
        onGenerate={handleGeneratePlan}
        isExpired={isExpired}
        showLocationButton={hasDeviceAccess}
        onChangeLocationClick={() => setIsLocationOpen(true)}
      />

      <RecentActivity logs={recentLogs} isLoading={isLogsLoading} />

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        onSave={handleSaveLocation}
      />
    </div>
  );
}

export default HomePage;
