import { useState, useEffect, useCallback } from "react";
import { getSessionHistory, getSessionLogs } from "../services/api";
import SessionTable from "../components/activity/SessionTable";
import SessionDetailView from "../components/activity/SessionDetailView";

/**
 * ActivityLogPage.
 * Orchestrates session history state and toggles between the session table
 * and detailed session view.
 */
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

  return (
    <div className="section-stack">
      {error && (
        <p className="text-red-400 text-xs border border-red-400/20 rounded p-3 bg-red-400/10 font-medium">
          {error}
        </p>
      )}

      {selectedSession ? (
        <SessionDetailView
          session={selectedSession}
          logs={selectedSessionLogs}
          isLoading={isLogsLoading}
          onBack={handleBackToList}
        />
      ) : (
        <SessionTable
          sessions={sessions}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={() => fetchHistory(true)}
          onSelectSession={handleSelectSession}
        />
      )}
    </div>
  );
}

export default ActivityLogPage;
