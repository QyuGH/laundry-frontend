import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { formatPhtTime } from "./SessionRow";

const EVENT_NAME_MAP = {
  session_started: "Drying session started",
  deploy_triggered: "Clothes rack deployed outdoors",
  retract_triggered: "Clothes rack retracted indoors",
  rain_detected: "Rain sensor triggered retraction",
  area_cleared: "Rain cleared, countdown started",
  auto_redeployment_triggered: "Clothes redeployed after rain cleared",
  auto_redeploy_triggered: "Clothes redeployed after rain cleared",
  auto_close_triggered: "Target reached and session ended",
  schedule_created: "Drying schedule created",
  schedule_cancelled: "Drying schedule cancelled",
  schedule_executed: "Scheduled drying action executed",
  session_ended: "Session terminated successfully",
  motor_fault_detected: "Motor fault detected on rack",
};

function formatEventTitle(eventType) {
  if (EVENT_NAME_MAP[eventType]) return EVENT_NAME_MAP[eventType];
  return eventType
    .split("_")
    .map((word, i) =>
      i === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase(),
    )
    .join(" ");
}

function renderTimelineNode(eventType) {
  if (eventType === "session_ended" || eventType === "auto_close_triggered") {
    return (
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        <CheckCircle className="w-4 h-4 text-brand" weight="fill" />
      </div>
    );
  }

  if (eventType === "motor_fault_detected") {
    return (
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        <XCircle className="w-4 h-4 text-danger" weight="fill" />
      </div>
    );
  }

  return (
    <div className="w-5 h-5 flex items-center justify-center shrink-0">
      <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
    </div>
  );
}

function SessionTimeline({ logs, isLoading }) {
  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <span className="text-xs font-medium text-text-muted tracking-wide">
          Loading session events...
        </span>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="py-6 text-center">
        <span className="text-xs font-medium text-text-muted">
          No events recorded for this session.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-2">
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;
        const eventTitle = formatEventTitle(log.eventType);

        return (
          <div key={log.id || index} className="flex gap-3.5">
            <div className="flex flex-col items-center shrink-0">
              {renderTimelineNode(log.eventType)}
              {!isLast && <div className="w-px flex-1 bg-border my-0.5" />}
            </div>

            <div className={`flex-1 min-w-0 ${!isLast ? "pb-6" : "pb-1"}`}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <p className="text-sm font-semibold font-display text-text leading-snug">
                  {eventTitle}
                </p>
                <span className="text-xs font-medium text-text-muted tracking-wide shrink-0">
                  {formatPhtTime(log.timestamp)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SessionTimeline;
