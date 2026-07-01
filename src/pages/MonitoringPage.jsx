import { useAuth } from "../context/AuthContext";
import useRtdbListener from "../hooks/useRtdbListener";
import MonitoringMetricsGrid from "../components/monitoring/MonitoringMetricsGrid";
import ControlPanel from "../components/monitoring/ControlPanel";
import DryingEstimate from "../components/monitoring/DryingEstimate";
import SchedulerSection from "../components/monitoring/SchedulerSection";

/**
 * Monitoring page.
 * Subscribes to live device sensors and status telemetry from Firebase RTDB.
 * Coordinates layout for Status metrics, Control Panel, Drying Progress, and Scheduler.
 *
 * @returns {JSX.Element}
 */
function MonitoringPage() {
  const { claims } = useAuth();
  const deviceId = claims?.deviceId ?? null;

  const { data: status, isLoading: isStatusLoading } = useRtdbListener(
    deviceId ? `devices/${deviceId}/status` : null,
  );

  const { data: sensors, isLoading: isSensorsLoading } = useRtdbListener(
    deviceId ? `devices/${deviceId}/sensors` : null,
  );

  const isLoading = isStatusLoading || isSensorsLoading;

  return (
    <div className="p-5 md:p-6 bg-bg-dark min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Row 1, Col 1 (desktop): Status Section (Metrics Grid) */}
        <div className="flex flex-col gap-6">
          <MonitoringMetricsGrid
            status={status}
            sensors={sensors}
            isLoading={isLoading}
          />
        </div>

        {/* Row 1, Col 2 (desktop): Controls Section */}
        <div className="flex flex-col">
          <ControlPanel />
        </div>

        {/* Row 2, Col 1 (desktop): Drying Progress Section */}
        <div className="flex flex-col">
          <DryingEstimate />
        </div>

        {/* Row 2, Col 2 (desktop): Scheduler Section */}
        <div className="flex flex-col">
          <SchedulerSection />
        </div>
      </div>
    </div>
  );
}

export default MonitoringPage;
