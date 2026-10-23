import SessionCard from "./SessionCard";

function SessionList({
  sessions,
  isLoading,
  hasMore,
  onLoadMore,
  onSelectSession,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col max-w-2xl">
        <span className="text-xs font-bold tracking-widest text-brand uppercase font-display mb-1.5">
          Your Drying Record
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-text tracking-tight leading-tight">
          Past laundry sessions
        </h2>
        <p className="text-sm text-text-muted mt-2">
          Review outcomes and conditions from previous sessions.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
        <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
          Most Recent First
        </span>
        <span className="text-xs text-text-muted font-medium">
          Select any session to review its environmental conditions and device
          events.
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onSelect={onSelectSession}
          />
        ))}
      </div>

      {sessions.length === 0 && !isLoading && (
        <div className="rounded-lg border border-border bg-surface p-12 text-center shadow-card">
          <p className="text-sm text-text-muted">
            No past sessions recorded yet.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <span className="text-xs font-medium text-text-muted tracking-wide">
            Loading session history...
          </span>
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:text-brand hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer"
          >
            Load More Sessions
          </button>
        </div>
      )}
    </div>
  );
}

export default SessionList;
