import { useState, useCallback } from "react";
import Modal from "../common/Modal";

const CONNECTION_CONFIG = {
  checking: {
    badge: "●",
    label: "Connecting",
    description: "Loading device state...",
    color: "text-text-muted",
  },
  offline: {
    badge: "●",
    label: "Device Offline",
    description:
      "The device did not respond. Ensure it is powered on and connected.",
    color: "text-red-400",
  },
  online: {
    badge: "●",
    label: "Device Ready",
    description: "Device is online and ready to receive commands.",
    color: "text-green-400",
  },
};

const SESSION_CONFIG = {
  active: {
    badge: "●",
    label: "Session Active",
    description: "Clothesline is deployed. Drying session is in progress.",
    color: "text-blue-400",
  },
  paused: {
    badge: "●",
    label: "Session Paused",
    description:
      "Session is paused. Clothesline is retracted to the protected zone.",
    color: "text-yellow-400",
  },
  "rain-interrupted": {
    badge: "●",
    label: "Rain Detected",
    description:
      "Session automatically paused due to rain. Resume when conditions clear.",
    color: "text-yellow-400",
  },
  pending: {
    badge: "●",
    label: "Session Queued",
    description: "A scheduled session is pending. Waiting for deployment time.",
    color: "text-text-muted",
  },
};

const FABRIC_BASELINES = {
  synthetic: 2,
  blended: 3,
  cotton: 4,
  heavy: 6,
};

/**
 * ControlPanel component.
 * Handles manually starting, pausing, resuming, and ending laundry sessions.
 * Displays real-time device connection status badges and description messages.
 *
 * @param {object} props
 * @param {object|null} props.session - The active session document data.
 * @param {string} props.deviceConnection - The parsed device status: "checking"|"online"|"offline".
 * @param {function} props.onRefresh - Callback to refresh active session data.
 * @param {function} props.onStartSession - Action handler to initialize session.
 * @param {function} props.onDeploy - Action handler to deploy clothesline.
 * @param {function} props.onRetract - Action handler to retract clothesline.
 * @param {function} props.onEndSession - Action handler to terminate session.
 * @returns {JSX.Element}
 */
function ControlPanel({
  session,
  deviceConnection,
  onStartSession,
  onDeploy,
  onRetract,
  onEndSession,
}) {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [fabricType, setFabricType] = useState("synthetic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const sessionStatus = session?.status ?? null;
  const isOnline = deviceConnection === "online";
  const isChecking = deviceConnection === "checking";
  const isOffline = deviceConnection === "offline";

  const isInactive = !session;
  const isPending = sessionStatus === "pending";
  const isActive = sessionStatus === "active";
  const isPausedOrInterrupted =
    sessionStatus === "paused" || sessionStatus === "rain-interrupted";

  // Resolve what badge status and description message to show
  const statusBadge = (() => {
    if (isChecking) return CONNECTION_CONFIG.checking;
    if (isOffline) return CONNECTION_CONFIG.offline;
    if (sessionStatus && SESSION_CONFIG[sessionStatus])
      return SESSION_CONFIG[sessionStatus];
    return CONNECTION_CONFIG.online;
  })();

  const withSubmit = useCallback(async (action) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleConfirmStart = () =>
    withSubmit(async () => {
      await onStartSession({
        fabricType,
        fabricBaselineDuration: FABRIC_BASELINES[fabricType],
      });
      setIsStartModalOpen(false);
    });

  const handleConfirmPause = () =>
    withSubmit(async () => {
      await onRetract();
      setIsPauseModalOpen(false);
    });

  const handleConfirmEnd = () =>
    withSubmit(async () => {
      await onEndSession();
      setIsEndModalOpen(false);
    });

  return (
    <div className="flex flex-col gap-4 p-5 rounded-lg border border-border-muted bg-glass-card h-full min-h-[220px]">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest font-semibold">
          Controls
        </span>
      </div>

      {/* Connection / Status Badge */}
      <div className="flex flex-col gap-1">
        <div className={`flex items-center gap-2 ${statusBadge.color}`}>
          <span className="text-base leading-none">{statusBadge.badge}</span>
          <span className="text-sm font-semibold">{statusBadge.label}</span>
        </div>
        <p className="text-text-muted text-xs leading-relaxed">
          {statusBadge.description}
        </p>
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <p className="text-red-400 text-xs border border-red-400/20 rounded p-2.5 bg-red-400/10 font-medium">
          {actionError}
        </p>
      )}

      {/* Action Buttons Container */}
      <div className="flex flex-col gap-3 flex-grow justify-end">
        {/* State 1: Connecting state */}
        {isChecking && (
          <p className="text-text-muted text-xs italic text-center">
            Verifying device connection...
          </p>
        )}

        {/* State 2: Device is offline while session is inactive */}
        {isOffline && isInactive && (
          <p className="text-red-400 text-xs italic text-center">
            Device must be online to initialize a drying session.
          </p>
        )}

        {/* State 3: Device goes offline mid-session */}
        {isOffline && !isInactive && (
          <p className="text-red-400 text-xs italic text-center">
            Commands are disabled until the device reconnects.
          </p>
        )}

        {/* State 4: Device is online, no active session */}
        {isOnline && isInactive && (
          <button
            id="start-session-btn"
            onClick={() => {
              setActionError(null);
              setIsStartModalOpen(true);
            }}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
          >
            Start Session
          </button>
        )}

        {/* State 5: Session is pending deployment */}
        {isOnline && isPending && (
          <div className="flex flex-col gap-2">
            <button
              id="deploy-now-btn"
              onClick={() => withSubmit(onDeploy)}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
            >
              Deploy Now
            </button>
            <button
              id="cancel-pending-btn"
              onClick={() => setIsEndModalOpen(true)}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text-muted hover:bg-bg-light transition bg-bg disabled:opacity-50"
            >
              Cancel Session
            </button>
          </div>
        )}

        {/* State 6: Session is active (deployed) */}
        {isOnline && isActive && (
          <button
            id="pause-retract-btn"
            onClick={() => {
              setActionError(null);
              setIsPauseModalOpen(true);
            }}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
          >
            Pause & Retract
          </button>
        )}

        {/* State 7: Session is paused or rain-interrupted */}
        {isOnline && isPausedOrInterrupted && (
          <div className="grid grid-cols-2 gap-3">
            <button
              id="resume-session-btn"
              onClick={() => withSubmit(onDeploy)}
              disabled={isSubmitting}
              className="py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
            >
              Resume
            </button>
            <button
              id="end-session-btn"
              onClick={() => {
                setActionError(null);
                setIsEndModalOpen(true);
              }}
              disabled={isSubmitting}
              className="py-2.5 rounded-md text-sm font-medium border border-border text-text-muted hover:bg-bg-light transition bg-bg disabled:opacity-50"
            >
              End Session
            </button>
          </div>
        )}
      </div>

      {/* Start Session Modal */}
      <Modal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="Start Laundry Session"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            The clothesline will be deployed and a drying session will begin
            tracking. Select the fabric type to continue.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-muted">
              Fabric Type
            </label>
            <select
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              className="w-full p-2 rounded border border-border bg-bg-dark text-text text-sm"
            >
              <option value="synthetic">Synthetic (Est. 2 hrs)</option>
              <option value="blended">Blended (Est. 3 hrs)</option>
              <option value="cotton">Cotton (Est. 4 hrs)</option>
              <option value="heavy">Heavy / Thick (Est. 6 hrs)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-1">
            <button
              onClick={() => setIsStartModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text text-sm transition"
            >
              Cancel
            </button>
            <button
              id="confirm-deploy-btn"
              onClick={handleConfirmStart}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? "Deploying..." : "Confirm & Deploy"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Pause & Retract Modal */}
      <Modal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        title="Pause & Retract"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            The clothesline will be retracted to the protected zone and the
            drying session will be paused. Progress tracking will resume when
            you redeploy.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsPauseModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text text-sm transition"
            >
              Cancel
            </button>
            <button
              id="confirm-pause-btn"
              onClick={handleConfirmPause}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? "Retracting..." : "Confirm Pause"}
            </button>
          </div>
        </div>
      </Modal>

      {/* End Session Modal */}
      <Modal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        title="End Session"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to end this laundry session? The clothesline
            will remain in the protected zone and progress tracking will be
            finalized.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEndModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text text-sm transition"
            >
              Cancel
            </button>
            <button
              id="confirm-end-session-btn"
              onClick={handleConfirmEnd}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? "Ending..." : "Confirm End Session"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ControlPanel;
