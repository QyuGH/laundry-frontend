import { useState, useEffect, useCallback } from "react";
import { getSessionHistory, getSessionLogs } from "../services/api";

function ActivityLogPage() {
  const [sessions, setSessions] = useState([]);
  const [lastSessionId, setLastSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSessionLogs, setSelectedSessionLogs] = useState([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(
    async (isLoadMore = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const cursor = isLoadMore ? lastSessionId : null;
        // Fetch 5 sessions per load/page limit
        const response = await getSessionHistory(5, cursor);
        if (response && response.sessions) {
          setSessions((prev) =>
            isLoadMore ? [...prev, ...response.sessions] : response.sessions,
          );
          setLastSessionId(response.lastSessionId);
          setHasMore(
            response.sessions.length === 5 && response.lastSessionId !== null,
          );
        }
      } catch (err) {
        setError(err.message || "Failed to load session history.");
      } finally {
        setIsLoading(false);
      }
    },
    [lastSessionId],
  );

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    setIsLogsLoading(true);
    setError(null);
    try {
      const response = await getSessionLogs(session.id);
      if (response && response.logs) {
        setSelectedSessionLogs(response.logs);
      }
    } catch (err) {
      setError(err.message || "Failed to load session logs.");
    } finally {
      setIsLogsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedSession(null);
    setSelectedSessionLogs([]);
  };

  const getFriendlyEventName = (eventType) => {
    const maps = {
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

  if (selectedSession) {
    return (
      <div className="p-5 md:p-6 bg-bg-dark min-h-full flex flex-col items-center">
        {/* Full width container to match other pages */}
        <div className="w-full flex flex-col gap-6">
          {/* Back Action */}
          <div>
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-text-muted hover:text-text transition text-sm font-semibold"
            >
              ← Back to Session Log
            </button>
          </div>

          {/* Session Overview Card */}
          <div className="p-5 rounded-lg border border-border-muted bg-glass-card">
            <h2 className="text-text text-sm font-semibold uppercase tracking-wider mb-4">
              Session Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-text-muted">
              <div>
                <p className="uppercase tracking-widest text-[10px] text-white/40 mb-1">
                  Fabric Type
                </p>
                <p className="text-text font-semibold capitalize">
                  {selectedSession.fabricType}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-[10px] text-white/40 mb-1">
                  Progress Reached
                </p>
                <p className="text-text font-semibold">
                  {selectedSession.finalDryingProgress
                    ? `${Math.round(selectedSession.finalDryingProgress)}%`
                    : "Not recorded"}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-[10px] text-white/40 mb-1">
                  End Reason
                </p>
                <p className="text-text font-semibold capitalize">
                  {selectedSession.endReason || "Completed"}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-[10px] text-white/40 mb-1">
                  Date Created
                </p>
                <p className="text-text font-semibold">
                  {formatPhtTime(selectedSession.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="p-5 rounded-lg border border-border-muted bg-glass-card flex flex-col gap-6">
            <h3 className="text-text text-sm font-semibold uppercase tracking-wider">
              Activity History
            </h3>

            {isLogsLoading ? (
              <p className="text-text-muted text-xs italic text-center py-4">
                Loading session logs...
              </p>
            ) : selectedSessionLogs.length === 0 ? (
              <p className="text-text-muted text-xs italic text-center py-4">
                No logs recorded for this session.
              </p>
            ) : (
              <div className="relative pl-6 border-l border-border-muted flex flex-col gap-6">
                {selectedSessionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="relative flex flex-col gap-1 text-xs"
                  >
                    <span className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-blue-400 border border-bg-dark" />
                    <p className="text-text font-semibold leading-relaxed">
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
      </div>
    );
  }

  return (
    <div className="p-5 md:p-6 bg-bg-dark min-h-full flex flex-col items-center">
      {/* Full width container to match other pages */}
      <div className="w-full flex flex-col gap-6">
        <div>
          <p className="text-text-muted text-xs">
            Review past laundry sessions and automated actions taken by the
            device.
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-xs border border-red-400/20 rounded p-3 bg-red-400/10 font-medium">
            {error}
          </p>
        )}

        {/* Sessions list */}
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSelectSession(session)}
              className="p-4 rounded-lg border border-border-muted bg-glass-card hover:bg-bg-light/30 transition cursor-pointer flex items-center justify-between gap-4"
            >
              {/* Internal columns stretching to fill full row cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 flex-grow text-xs">
                {/* Column 1: Date and Time */}
                <div>
                  <p className="text-text font-medium">
                    {formatPhtTime(session.createdAt)}
                  </p>
                </div>

                {/* Column 2: Details */}
                <div className="text-text-muted flex items-center gap-1.5 capitalize">
                  <span>{session.fabricType} Fabric</span>
                </div>

                {/* Column 3: Stats */}
                <div className="text-text-muted">
                  <span>Progress Reached: </span>
                  <span className="text-text font-medium">
                    {session.finalDryingProgress
                      ? `${Math.round(session.finalDryingProgress)}%`
                      : "0%"}
                  </span>
                </div>
              </div>

              {/* Column 4: Nav indicator */}
              <div className="text-text-muted text-base pl-2">
                <span>→</span>
              </div>
            </div>
          ))}

          {sessions.length === 0 && !isLoading && (
            <p className="text-text-muted text-xs italic text-center py-6">
              No past sessions found.
            </p>
          )}

          {isLoading && (
            <p className="text-text-muted text-xs italic text-center py-4">
              Loading session history...
            </p>
          )}

          {hasMore && !isLoading && (
            <button
              onClick={() => fetchHistory(true)}
              className="w-full mt-2 py-2 rounded-md text-xs font-semibold border border-border text-text hover:bg-bg-light transition bg-bg"
            >
              Load More Sessions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityLogPage;
