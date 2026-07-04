import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useRtdbListener from "../hooks/useRtdbListener";
import useHandshake from "../hooks/useHandshake";
import MonitoringMetricsGrid from "../components/monitoring/MonitoringMetricsGrid";
import ControlPanel from "../components/monitoring/ControlPanel";
import DryingEstimate from "../components/monitoring/DryingEstimate";
import SchedulerSection from "../components/monitoring/SchedulerSection";
import {
  getActiveSession,
  startSession,
  deploySession,
  retractSession,
  endSession,
  createSchedule,
  cancelSchedule,
} from "../services/api";

/**
 * Monitoring page.
 * Orchestrates states (active session, schedules), RTDB telemetry, and API actions.
 *
 * @returns {JSX.Element}
 */
function MonitoringPage() {
  const { claims } = useAuth();
  const deviceId = claims?.deviceId ?? null;

  const [session, setSession] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const { data: status, isLoading: isStatusLoading } = useRtdbListener(
    deviceId ? `devices/${deviceId}/status` : null,
  );

  const { data: sensors, isLoading: isSensorsLoading } = useRtdbListener(
    deviceId ? `devices/${deviceId}/sensors` : null,
  );

  const { data: progressData, isLoading: isProgressLoading } = useRtdbListener(
    deviceId ? `devices/${deviceId}/dryingProgress` : null,
  );

  const { deviceStatus, runHandshakeCheck } = useHandshake(deviceId, status);

  const fetchSessionData = async () => {
    try {
      const response = await getActiveSession();
      if (response && response.session) {
        setSession(response.session);
        setSchedule(response.session.schedule || null);
      } else {
        setSession(null);
        setSchedule(null);
      }
    } catch {
      setSession(null);
      setSchedule(null);
    } finally {
      setIsSessionLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  const handleStartSession = async (sessionData) => {
    const res = await startSession(sessionData);
    await fetchSessionData();
    return res;
  };

  const handleDeploy = async () => {
    const res = await deploySession();
    await fetchSessionData();
    return res;
  };

  const handleRetract = async () => {
    const res = await retractSession();
    await fetchSessionData();
    return res;
  };

  const handleEndSession = async () => {
    const res = await endSession();
    await fetchSessionData();
    return res;
  };

  const handleSetSchedule = async (scheduleData) => {
    if (!session) {
      const res = await startSession(scheduleData);
      await fetchSessionData();
      return res;
    } else {
      const res = await createSchedule(scheduleData);
      await fetchSessionData();
      return res;
    }
  };

  const handleCancelSchedule = async () => {
    if (!session || !schedule) return;
    const res = await cancelSchedule(schedule.id, session.id);
    await fetchSessionData();
    return res;
  };

  const isRtdbLoading =
    isStatusLoading || isSensorsLoading || isProgressLoading;
  const isLoading = isSessionLoading || isRtdbLoading;

  return (
    <div className="p-5 md:p-6 bg-bg-dark min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col gap-6">
          <MonitoringMetricsGrid
            status={status}
            sensors={sensors}
            isLoading={isLoading}
          />
        </div>

        <div className="flex flex-col">
          <ControlPanel
            session={session}
            deviceStatus={deviceStatus}
            onHandshake={runHandshakeCheck}
            onRefresh={fetchSessionData}
            onStartSession={handleStartSession}
            onDeploy={handleDeploy}
            onRetract={handleRetract}
            onEndSession={handleEndSession}
          />
        </div>

        <div className="flex flex-col">
          <DryingEstimate
            session={session}
            progressData={progressData}
            isLoading={isLoading}
          />
        </div>

        <div className="flex flex-col">
          <SchedulerSection
            session={session}
            schedule={schedule}
            onSetSchedule={handleSetSchedule}
            onCancelSchedule={handleCancelSchedule}
          />
        </div>
      </div>
    </div>
  );
}

export default MonitoringPage;
