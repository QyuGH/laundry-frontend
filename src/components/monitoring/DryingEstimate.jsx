/**
 * Renders the drying progress tracking bar and estimated details.
 *
 * @param {object} props
 * @param {object|null} props.session - The active session document data.
 * @param {object|null} props.progressData - The live drying progress from RTDB ({ percentage, updatedAt }).
 * @param {boolean} props.isLoading - Whether the progress data is loading.
 * @returns {JSX.Element}
 */
function DryingEstimate({ session, progressData, isLoading }) {
  const isInactive = !session;
  const isPending = session?.status === "pending";
  const fabricLabel = session?.fabricType
    ? session.fabricType.charAt(0).toUpperCase() + session.fabricType.slice(1)
    : "";

  let percentage = 0;
  let statusText = "Awaiting sensor telemetry...";

  if (!isInactive && !isPending && progressData?.percentage !== undefined) {
    percentage = Math.min(100, Math.max(0, progressData.percentage));
    statusText = `${Math.round(percentage)}% dried`;
  }

  return (
    <div className="flex flex-col gap-4 p-5 rounded-lg border border-border-muted bg-glass-card h-full min-h-[220px]">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest font-semibold">
          Drying Progress
        </span>
        {!isInactive && (
          <span className="text-text-muted text-xs font-medium">
            Fabric: {fabricLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col justify-center flex-grow gap-4">
        {isInactive ? (
          <div className="flex flex-col justify-center items-center flex-grow">
            <p className="text-text-muted text-sm italic">
              No active drying session.
            </p>
          </div>
        ) : isPending ? (
          <div className="flex flex-col justify-center items-center flex-grow">
            <p className="text-text-muted text-sm italic">
              Session queued. Progress will track once deployed.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-baseline">
              <span className="text-text text-2xl font-semibold tracking-tight">
                {isLoading ? "Loading..." : statusText}
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-bg-light border border-border rounded-full h-3.5 overflow-hidden">
              {/* Progress Fill (using approved bg-highlight variable) */}
              <div
                className="bg-highlight h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="text-text-muted text-xs">
              Recalculates every 30 seconds based on live VPD readings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DryingEstimate;
