import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useRtdbListener from "../hooks/useRtdbListener";
import useDeviceWeather from "../hooks/useDeviceWeather";
import MetricsGrid from "../components/home/MetricsGrid";
import PlannerSection from "../components/home/PlannerSection";
import LocationModal from "../components/home/LocationModal";
import {
  getPlan,
  generatePlan,
  updateDeviceLocation,
  getDeviceLogs,
} from "../services/api";
import useDeviceConnection from "../hooks/useDeviceConnection";

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

  // Fetch saved plan on mount
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

  // Fetch recent device logs on mount
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

  const getFriendlyEventName = (eventType) => {
    const maps = {
      session_started: "Session initialized",
      deploy_triggered: "Pulley deployed manually",
      retract_triggered: "Pulley retracted manually",
      rain_detected: "Rain sensor triggered retraction",
      area_cleared: "Rain cleared, countdown started",
      auto_redeployment_triggered: "Weather cleared: auto-redeploy executed",
      auto_close_triggered: "Dry target met: session auto-closed",
      schedule_created: "Deployment/retraction schedule registered",
      schedule_cancelled: "Scheduled timer cancelled",
      schedule_executed: "Scheduled action executed automatically",
      session_ended: "Session terminated successfully",
    };
    return maps[eventType] || eventType;
  };

  const formatPhtTime = (timeData) => {
    if (!timeData) return "";
    let dateObj;
    if (
      timeData &&
      typeof timeData === "object" &&
      timeData._seconds !== undefined
    ) {
      dateObj = new Date(timeData._seconds * 1000);
    } else {
      dateObj = new Date(timeData);
    }
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }
    return (
      dateObj.toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " PHT"
    );
  };

  return (
    <div className="w-full bg-bg-dark border border-indigo-600">
      {/* 1. Changed back to items-stretch: Left and Right columns will always match in height.
        2. Added h-full on the columns to pass that matching height down to the children.
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Left Column */}
        <div className="md:col-span-2 flex flex-col gap-6 h-full">
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
        </div>

        {/* Right Column */}
        <section className="flex flex-col h-full">
          <h2 className="text-text text-sm font-medium mb-3 compress-shrink-0">
            Recent Activity
          </h2>

          {/* 1. Removed strict pixel height (h-[450px])
            2. Added flex-1 and min-h-[350px] so it fills available space but doesn't crush on small windows
          */}
          <div className="flex-1 flex flex-col rounded-lg border border-border-muted bg-glass-card p-5 min-h-[350px]">
            {/* Scroll container wraps only the log contents now */}
            <div className="flex-1 overflow-y-auto">
              {isLogsLoading ? (
                <p className="text-text-muted text-xs italic text-center py-4">
                  Loading activities...
                </p>
              ) : recentLogs.length === 0 ? (
                <p className="text-text-muted text-xs italic text-center py-4">
                  No recent activities.
                </p>
              ) : (
                <div className="relative pl-5 border-l border-border-muted flex flex-col gap-5">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="relative flex flex-col gap-0.5 text-xs"
                    >
                      <span className="absolute -left-[25px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 border border-bg-dark" />
                      <p className="text-text font-medium leading-normal">
                        {getFriendlyEventName(log.eventType)}
                      </p>
                      <p className="text-text-muted text-[10px] tracking-wide">
                        {formatPhtTime(log.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        onSave={handleSaveLocation}
      />
    </div>
  );
}

export default HomePage;
