import { useState } from "react";
import Modal from "../common/Modal";

/**
 * Handles starting, pausing, resuming, and ending laundry sessions.
 *
 * @param {object} props
 * @param {object|null} props.session - The active session document data.
 * @param {function} props.onRefresh - Callback to refresh active session data.
 * @param {function} props.onStartSession - Action handler to trigger session initialization.
 * @param {function} props.onDeploy - Action handler to resume deployment.
 * @param {function} props.onRetract - Action handler to pause deployment.
 * @param {function} props.onEndSession - Action handler to terminate session.
 * @returns {JSX.Element}
 */
function ControlPanel({
  session,
  onRefresh,
  onStartSession,
  onDeploy,
  onRetract,
  onEndSession,
}) {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [fabricType, setFabricType] = useState("synthetic");
  const [fabricDuration, setFabricDuration] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fabricBaselines = {
    synthetic: 2,
    blended: 3,
    cotton: 4,
    heavy: 6,
  };

  const handleFabricChange = (e) => {
    const selected = e.target.value;
    setFabricType(selected);
    setFabricDuration(fabricBaselines[selected]);
  };

  const handleStart = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onStartSession({
        fabricType,
        fabricBaselineDuration: fabricDuration,
      });
      setIsDeployModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onRetract();
      setIsPauseModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (apiCall) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiCall();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInactive = !session;
  const isPending = session?.status === "pending";
  const isActive = session?.status === "active";
  const isPaused = session?.status === "paused";
  const isInterrupted = session?.status === "rain-interrupted";

  return (
    <div className="flex flex-col gap-4 p-5 rounded-lg border border-border-muted bg-glass-card h-full min-h-[220px]">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest font-semibold">
          Controls
        </span>
        {error && (
          <span className="text-text text-xs font-medium max-w-[60%] truncate">
            {error}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 justify-center flex-grow">
        {isInactive && (
          <button
            onClick={() => setIsDeployModalOpen(true)}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
          >
            Start Session
          </button>
        )}

        {isPending && (
          <div className="flex flex-col gap-2">
            <p className="text-text-muted text-xs italic text-center mb-2">
              Waiting for scheduled deployment...
            </p>
            <button
              onClick={() => handleAction(onDeploy)}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
            >
              Deploy Now
            </button>
            <button
              onClick={() => handleAction(onEndSession)}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
            >
              Cancel Session
            </button>
          </div>
        )}

        {isActive && (
          <button
            onClick={() => setIsPauseModalOpen(true)}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
          >
            Pause & Retract
          </button>
        )}

        {(isPaused || isInterrupted) && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction(onDeploy)}
              disabled={isSubmitting}
              className="py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
            >
              Resume
            </button>
            <button
              onClick={() => handleAction(onEndSession)}
              disabled={isSubmitting}
              className="py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
            >
              End Session
            </button>
          </div>
        )}
      </div>

      {/* Start Session / Deploy Modal */}
      <Modal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        title="Start Laundry Session"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-muted">
              Fabric Type
            </label>
            <select
              value={fabricType}
              onChange={handleFabricChange}
              className="w-full p-2 rounded border border-border bg-bg-dark text-text text-sm"
            >
              <option value="synthetic">Synthetic (2 hrs)</option>
              <option value="blended">Blended (3 hrs)</option>
              <option value="cotton">Cotton (4 hrs)</option>
              <option value="heavy">Heavy/Thick (6 hrs)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setIsDeployModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm transition disabled:opacity-50"
            >
              Confirm & Deploy
            </button>
          </div>
        </div>
      </Modal>

      {/* Pause Confirmation Modal */}
      <Modal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        title="Pause & Retract Motor"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to pause the session and retract the
            clothesline?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsPauseModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePause}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm transition disabled:opacity-50"
            >
              Confirm Pause
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ControlPanel;
