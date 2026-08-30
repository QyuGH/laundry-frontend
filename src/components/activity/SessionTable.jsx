import SessionRow from "./SessionRow";

/**
 * Renders the main section header and unified card shell table for session history.
 */
function SessionTable({
  sessions,
  isLoading,
  hasMore,
  onLoadMore,
  onSelectSession,
}) {
  return (
    <section className="flex flex-col gap-block">
      {/* Section Header */}
      <div className="section-header">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-text-muted">
            Past laundry sessions and automated actions taken by the device.
          </p>
        </div>
      </div>

      {/* Card Shell Table Container */}
      <div className="card-shell flex flex-col gap-block">
        {/* Table Header Row (Visible on sm screens and up) */}
        <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-border-muted text-xs uppercase tracking-widest text-text-muted font-medium px-3">
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-3">Fabric Type</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">Progress</div>
          <div className="col-span-2">Status</div>
        </div>

        {/* Log Rows */}
        <div className="flex flex-col">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onSelect={onSelectSession}
            />
          ))}
        </div>

        {/* Empty & Loading States */}
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

        {/* Footer Action Button */}
        {hasMore && !isLoading && (
          <div className="flex justify-center pt-2">
            <button
              onClick={onLoadMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-xs font-semibold border border-border text-text hover:bg-bg-light transition bg-bg"
            >
              <span>Load More Sessions</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default SessionTable;
