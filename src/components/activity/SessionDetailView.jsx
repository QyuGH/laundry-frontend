import SessionTimeline from "./SessionTimeline";
import { formatPhtTime } from "./SessionRow";

/**
 * Renders the detailed view when a session is selected.
 */
function SessionDetailView({ session, logs, isLoading, onBack }) {
  return (
    <div className="flex flex-col gap-block">
      {/* Back Button Action */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-text transition text-sm font-semibold"
        >
          ← Back to Activity Log
        </button>
      </div>

      {/* Session Overview Card */}
      <div className="card-shell flex flex-col gap-block">
        <div className="section-header pb-2 border-b border-border-muted">
          <h2 className="text-sm font-medium text-text">Session Details</h2>
        </div>

        <div className="stat-grid">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              Fabric Type
            </span>
            <span className="text-sm text-text font-semibold capitalize">
              {session.fabricType || "Synthetic"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              Progress Reached
            </span>
            <span className="text-sm text-text font-semibold">
              {session.finalDryingProgress
                ? `${Math.round(session.finalDryingProgress)}%`
                : "0%"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              End Reason
            </span>
            <span className="text-sm text-text font-semibold capitalize">
              {session.endReason || "Completed"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">
              Date Created
            </span>
            <span className="text-sm text-text font-semibold">
              {formatPhtTime(session.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className="card-shell flex flex-col gap-block">
        <div className="section-header pb-2 border-b border-border-muted">
          <h2 className="text-sm font-medium text-text">Activity History</h2>
        </div>

        <SessionTimeline logs={logs} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default SessionDetailView;
