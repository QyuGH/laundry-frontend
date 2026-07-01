/**
 * Drying Progress Estimate container shell.
 *
 * @returns {JSX.Element}
 */
function DryingEstimate() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-border-muted bg-glass-card h-full min-h-[160px]">
      <span className="text-text-muted text-xs uppercase tracking-widest font-medium">
        Drying Progress
      </span>
      <div className="flex flex-col justify-center items-center flex-grow">
        <p className="text-text-muted text-sm italic">Drying Progress Shell</p>
      </div>
    </div>
  );
}

export default DryingEstimate;
