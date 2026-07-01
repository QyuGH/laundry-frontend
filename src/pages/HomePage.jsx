import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useRtdbListener from "../hooks/useRtdbListener";
import useDeviceWeather from "../hooks/useDeviceWeather";
import MetricsGrid from "../components/home/MetricsGrid";
import PlannerSection from "../components/home/PlannerSection";
import LocationModal from "../components/home/LocationModal";
import { getPlan, generatePlan, updateDeviceLocation } from "../services/api";

function HomePage() {
  const { claims } = useAuth();
  const deviceId = claims?.deviceId ?? null;
  const hasDeviceAccess = !!claims?.deviceId;

  const [plan, setPlan] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const {
    weather,
    locationName,
    hourLabel,
    isLoading: isWeatherLoading,
    error: weatherError,
    // Add custom trigger to refetch weather on location change
    weatherRefetch,
  } = useDeviceWeather();

  const { data: isOnline } = useRtdbListener(
    deviceId ? `devices/${deviceId}/status/isOnline` : null,
  );

  // Fetch saved plan on mount
  useEffect(() => {
    const fetchSavedPlan = async () => {
      try {
        const savedPlan = await getPlan();
        if (savedPlan) {
          setPlan(savedPlan);

          // Check expiration
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
    // 1. Write new coordinates to device document
    await updateDeviceLocation(locationData);

    // 2. Refetch overview weather cards
    if (weatherRefetch) {
      await weatherRefetch();
    }

    // 3. Auto-regenerate plan to reflect the new location
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
    <div className="p-5 md:p-6 bg-bg-dark min-h-full">
      <div className="flex flex-col md:grid md:grid-cols-3 gap-6 items-stretch">
        {/* Left Column */}
        <div className="flex flex-col gap-6 md:col-span-2">
          <MetricsGrid
            isOnline={isOnline}
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
        <div className="flex flex-col">
          <section className="flex flex-col flex-1">
            <h2 className="text-text text-sm font-medium mb-3">
              Recent Activity
            </h2>
            <div className="flex-1 rounded-lg border border-border-muted bg-bg p-5 min-h-[200px] md:min-h-0">
              <p className="text-text-muted text-sm">
                Recent activity content pending.
              </p>
            </div>
          </section>
        </div>
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
