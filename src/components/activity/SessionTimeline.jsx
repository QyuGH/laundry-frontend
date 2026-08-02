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

/**
 * Renders the vertical timeline of session activity events.
 */
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
    <div className="relative pl-6 border-l border-border-muted flex flex-col gap-6">
      {logs.map((log) => (
        <div key={log.id} className="relative flex flex-col gap-1 text-xs">
          <span className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-highlight border border-bg-dark" />
          <p className="text-text font-semibold leading-relaxed">
            {EVENT_NAME_MAP[log.eventType] || log.eventType}
          </p>
          <p className="text-text-muted text-[10px] tracking-wide">
            {formatPhtTime(log.timestamp)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default SessionTimeline;
