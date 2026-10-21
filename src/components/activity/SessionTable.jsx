import SessionRow from "./SessionRow";

function SessionTable({
  sessions,
  isLoading,
  hasMore,
  onLoadMore,
  onSelectSession,
}) {
  return (
    <section className="flex flex-col gap-block">
      <div className="section-header">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-text-muted">Past laundry sessions</p>
        </div>
      </div>

      <div className="card-shell flex flex-col gap-block">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-3 pb-2 border-b border-border-muted text-xs uppercase tracking-widest text-text-muted font-medium">
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-3">Fabric Type</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">Progress</div>
          <div className="col-span-2">Status</div>
        </div>

        <div className="flex flex-col">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onSelect={onSelectSession}
            />
          ))}
        </div>

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
          <div className="flex justify-center pt-2">
            <button
              onClick={onLoadMore}
              className="inline-flex items-center gap-inline px-4 py-2 rounded-md text-xs font-semibold border border-border text-text-muted hover:text-text bg-surface-bg hover:bg-canvas-bg transition-colors duration-150 cursor-pointer"
            >
              Load More Sessions
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default SessionTable;
