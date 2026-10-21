import { formatPhtTime } from "./SessionRow";

const EVENT_NAME_MAP = {
  session_started: "Session initialized",
  deploy_triggered: "Pulley deployment command sent",
  retract_triggered: "Pulley retraction command sent",
  rain_detected: "Rain sensor triggered retraction",
  area_cleared: "Rain cleared, countdown started",
  auto_redeployment_triggered: "Weather cleared: auto-redeploy executed",
  auto_close_triggered: "Dry target met: session auto-closed",
  schedule_created: "Deployment/retraction schedule registered",
  schedule_cancelled: "Scheduled timer cancelled",
  schedule_executed: "Scheduled action executed automatically",
  session_ended: "Session terminated successfully",
};

const WARNING_EVENTS = ["rain_detected"];
const SUCCESS_EVENTS = [
  "deploy_triggered",
  "auto_redeployment_triggered",
  "auto_close_triggered",
  "session_ended",
];

function getEventDotColor(eventType) {
  if (WARNING_EVENTS.includes(eventType)) return "bg-warning";
  if (SUCCESS_EVENTS.includes(eventType)) return "bg-success";
  return "bg-primary";
}

function SessionTimeline({ logs, isLoading }) {
  if (isLoading) {
    return (
      <p className="text-text-muted text-xs italic text-center py-4">
        Loading session logs...
      </p>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <p className="text-text-muted text-xs italic text-center py-4">
        No logs recorded for this session.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;
        const dotColor = getEventDotColor(log.eventType);

        return (
          <div key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-2 h-2 rounded-full mt-1 ${dotColor}`} />
              {!isLast && <div className="w-px flex-1 bg-border-muted mt-1" />}
            </div>
            <div className={`flex-1 ${!isLast ? "pb-6" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-block">
                <p className="text-xs font-medium text-text leading-relaxed">
                  {EVENT_NAME_MAP[log.eventType] || log.eventType}
                </p>
                <p className="text-xs text-text-muted tracking-wide shrink-0">
                  {formatPhtTime(log.timestamp)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SessionTimeline;
