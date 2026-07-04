import { useState, useCallback } from "react";
import Modal from "../common/Modal";

const STATUS_CONFIG = {
  idle: {
    badge: "●",
    label: "Initializing",
    description: "Loading device state...",
    color: "text-text-muted",
  },
  checking: {
    badge: "●",
    label: "Verifying",
    description: "Checking device connection. Please wait.",
    color: "text-text-muted",
  },
  offline: {
    badge: "●",
    label: "Device Unreachable",
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

const SESSION_STATUS_CONFIG = {
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
      "Session was automatically paused due to rain. Resume when conditions improve.",
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
 * Renders the device control panel with state-aware buttons and status messaging.
 * All actions are guarded by device connectivity checks and confirmation modals.
 *
 * @param {object} props
 * @param {object|null} props.session - The active session document.
 * @param {string} props.deviceStatus - The handshake status: "idle"|"checking"|"online"|"offline".
 * @param {function} props.onHandshake - Callback to retry the device handshake.
 * @param {function} props.onRefresh - Callback to refresh session data.
 * @param {function} props.onStartSession - Handler to start a new session.
 * @param {function} props.onDeploy - Handler to deploy (resume) the clothesline.
 * @param {function} props.onRetract - Handler to retract (pause) the clothesline.
 * @param {function} props.onEndSession - Handler to end the session.
 * @returns {JSX.Element}
 */
function ControlPanel({
  session,
  deviceStatus,
  onHandshake,
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

  const resolvedStatus = (() => {
    if (deviceStatus === "idle" || deviceStatus === "checking")
      return STATUS_CONFIG[deviceStatus];
    if (deviceStatus === "offline") return STATUS_CONFIG.offline;
    if (sessionStatus && SESSION_STATUS_CONFIG[sessionStatus])
      return SESSION_STATUS_CONFIG[sessionStatus];
    return STATUS_CONFIG.online;
  })();

  const isDeviceOnline = deviceStatus === "online";
  const isDeviceChecking =
    deviceStatus === "idle" || deviceStatus === "checking";
  const isDeviceOffline = deviceStatus === "offline";

  const isInactive = !session;
  const isPending = sessionStatus === "pending";
  const isActive = sessionStatus === "active";
  const isPausedOrInterrupted =
    sessionStatus === "paused" || sessionStatus === "rain-interrupted";

  const withSubmit = useCallback(async (action) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err.message || "An error occurred. Please try again.");
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
      setFabricType("synthetic");
    });

  const handleConfirmPause = () =>
    withSubmit(async () => {
      await onRetract();
      setIsPauseModalOpen(false);
    });

  const handleConfirmResume = () =>
    withSubmit(async () => {
      await onHandshake();
      if (deviceStatus !== "online") {
        throw new Error(
          "Device is unresponsive. Ensure it is powered on and try again.",
        );
      }
      await onDeploy();
    });

  const handleConfirmEnd = () =>
    withSubmit(async () => {
      await onEndSession();
      setIsEndModalOpen(false);
    });

  return (
    <div className="flex flex-col gap-4 p-5 rounded-lg border border-border-muted bg-glass-card h-full min-h-[220px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest font-semibold">
          Controls
        </span>
      </div>

      {/* Status Badge */}
      <div className="flex flex-col gap-1">
        <div className={`flex items-center gap-2 ${resolvedStatus.color}`}>
          <span className="text-base leading-none">{resolvedStatus.badge}</span>
          <span className="text-sm font-semibold">{resolvedStatus.label}</span>
        </div>
        <p className="text-text-muted text-xs leading-relaxed">
          {resolvedStatus.description}
        </p>
      </div>

      {/* Error Message */}
      {actionError && (
        <p className="text-red-400 text-xs border border-red-400/30 rounded px-3 py-2 bg-red-400/10">
          {actionError}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 flex-grow justify-end">
        {/* Checking state — no buttons, just a loading indicator */}
        {isDeviceChecking && (
          <p className="text-text-muted text-xs italic text-center">
            Verifying connection...
          </p>
        )}

        {/* Offline state — retry button only */}
        {isDeviceOffline && (
          <button
            id="initialize-device-btn"
            onClick={onHandshake}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
          >
            Initialize Device
          </button>
        )}

        {/* Online, inactive session — start session button */}
        {isDeviceOnline && isInactive && (
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

        {/* Online, session pending — show pending controls */}
        {isDeviceOnline && isPending && (
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

        {/* Online, session active — pause button */}
        {isDeviceOnline && isActive && (
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

        {/* Online, session paused or rain-interrupted — resume and end buttons */}
        {isDeviceOnline && isPausedOrInterrupted && (
          <div className="grid grid-cols-2 gap-3">
            <button
              id="resume-session-btn"
              onClick={handleConfirmResume}
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

        {/* Device offline during an active session — all commands blocked */}
        {isDeviceOffline && !isInactive && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-red-400 italic text-center">
              Commands are disabled until the device reconnects.
            </p>
            <button
              onClick={onHandshake}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
            >
              Retry Connection
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
              id="fabric-type-select"
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
          {actionError && <p className="text-red-400 text-xs">{actionError}</p>}
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
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm transition disabled:opacity-50"
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
          {actionError && <p className="text-red-400 text-xs">{actionError}</p>}
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
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm transition disabled:opacity-50"
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
          {actionError && <p className="text-red-400 text-xs">{actionError}</p>}
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
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm transition disabled:opacity-50"
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
