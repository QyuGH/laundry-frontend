import { useState, useCallback, useEffect } from "react";
import Modal from "../common/Modal";

const FABRIC_BASELINES = {
  synthetic: 2,
  blended: 3,
  cotton: 4,
  heavy: 6,
};

function ControlPanel({
  session,
  deviceConnection,
  motorStatus,
  fault,
  rainDetected,
  pulleyPosition,
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
  const [isInitialized, setIsInitialized] = useState(false);

  const sessionStatus = session?.status ?? null;
  const isOnline = deviceConnection === "online";
  const isChecking = deviceConnection === "checking";
  const isOffline = deviceConnection === "offline";

  const isInactive = !session;
  const isPending = sessionStatus === "pending";
  const isActive = sessionStatus === "active";
  const isPaused = sessionStatus === "paused";
  const isRainInterrupted = sessionStatus === "rain-interrupted";
  const isPausedOrInterrupted = isPaused || isRainInterrupted;

  const isMoving = isOnline && motorStatus === "moving";
  const hasFault = isOnline && fault && fault !== "NONE";
  const isRaining = rainDetected === true;

  useEffect(() => {
    if (!isOnline) {
      setIsInitialized(false);
    }
  }, [isOnline]);

  useEffect(() => {
    setIsInitialized(false);
  }, [sessionStatus]);

  const statusBadge = (() => {
    if (isChecking) {
      return {
        badge: "●",
        label: "Connecting",
        description: "Loading device state...",
        color: "text-text-muted",
      };
    }

    if (isOffline) {
      return {
        badge: "●",
        label: "Device Offline",
        description:
          "The device did not respond. Ensure it is powered on and connected.",
        color: "text-danger",
      };
    }

    if (hasFault) {
      return {
        badge: "▲",
        label: "Motor Timeout",
        description:
          "Movement stopped because the limit switch was not reached - check for physical obstructions.",
        color: "text-danger",
      };
    }

    if (isMoving) {
      const isDeploying = pulleyPosition !== "drying-zone";
      return {
        badge: "◌",
        label: isDeploying ? "Deploying..." : "Retracting...",
        description: isDeploying
          ? "The clothesline is moving to the drying zone and will activate once the limit switch confirms arrival."
          : "The clothesline is returning to the protected zone and will update once the limit switch confirms arrival.",
        color: "text-warning",
      };
    }

    if (isRainInterrupted && isRaining) {
      return {
        badge: "●",
        label: "Rain Detected",
        description:
          "Session is paused and retracted to the protected zone until the rain stops.",
        color: "text-warning",
      };
    }

    if (isRainInterrupted && !isRaining) {
      return {
        badge: "●",
        label: "Rain Cleared",
        description:
          "Rain has stopped; waiting for stabilization timer or manual resume.",
        color: "text-info",
      };
    }

    if (isActive) {
      return {
        badge: "●",
        label: "Session Active",
        description:
          "Clothesline is deployed in the drying zone and actively drying.",
        color: "text-success",
      };
    }

    if (isPaused) {
      return {
        badge: "●",
        label: "Session Paused",
        description: "Clothesline is safely retracted in the protected zone.",
        color: "text-warning",
      };
    }

    if (isPending) {
      return {
        badge: "●",
        label: "Session Queued",
        description:
          "Scheduled drying session is waiting for its scheduled deployment time.",
        color: "text-text-muted",
      };
    }

    return {
      badge: "●",
      label: "Device Ready",
      description: "Device is online and ready to receive commands.",
      color: "text-success",
    };
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

  const handleInitialize = () => {
    setIsSubmitting(true);
    setActionError(null);
    setTimeout(() => {
      if (isOnline) {
        setIsInitialized(true);
      } else {
        setActionError("Device verification failed. Ensure device is online.");
      }
      setIsSubmitting(false);
    }, 800);
  };

  const handleConfirmStart = () =>
    withSubmit(async () => {
      await onStartSession({
        fabricType,
        fabricBaselineDuration: FABRIC_BASELINES[fabricType],
      });
      setIsStartModalOpen(false);
      setIsInitialized(false);
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
    <div className="card-shell flex flex-col flex-1 gap-block">
      <div className="section-header pb-2 border-b border-border-muted">
        <h2 className="text-sm font-medium text-text">Controls</h2>
      </div>

      <div className="flex flex-col gap-1">
        <div className={`flex items-center gap-2 ${statusBadge.color}`}>
          <span className="text-base leading-none">{statusBadge.badge}</span>
          <span className="text-sm font-semibold">{statusBadge.label}</span>
        </div>
        <p className="text-text-muted text-xs leading-relaxed">
          {statusBadge.description}
        </p>
      </div>

      {actionError && (
        <p className="text-danger text-xs border border-danger/20 rounded p-2.5 bg-danger/10 font-medium">
          {actionError}
        </p>
      )}

      <div className="flex flex-col gap-stack">
        {isChecking && (
          <p className="text-text-muted text-xs italic text-center">
            Verifying device connection...
          </p>
        )}

        {isOffline && isInactive && (
          <p className="text-danger text-xs italic text-center">
            Device must be online to initialize a drying session.
          </p>
        )}

        {isOffline && !isInactive && (
          <p className="text-danger text-xs italic text-center">
            Commands are disabled until the device reconnects.
          </p>
        )}

        {isOnline && isInactive && (
          <>
            {!isInitialized ? (
              <button
                id="initialize-device-btn"
                onClick={handleInitialize}
                disabled={isSubmitting || hasFault}
                className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light hover:cursor-pointer transition bg-bg disabled:opacity-50"
              >
                {isSubmitting ? "Initializing..." : "Initialize Device"}
              </button>
            ) : (
              <button
                id="start-session-btn"
                onClick={() => {
                  setActionError(null);
                  setIsStartModalOpen(true);
                }}
                disabled={isSubmitting || hasFault || isRaining}
                className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light hover:cursor-pointer transition bg-bg disabled:opacity-50"
              >
                Deploy
              </button>
            )}
          </>
        )}

        {isOnline && isPending && (
          <div className="flex flex-col gap-2">
            <button
              id="deploy-now-btn"
              onClick={() => withSubmit(onDeploy)}
              disabled={isSubmitting || isMoving || hasFault || isRaining}
              className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light hover:cursor-pointer transition bg-bg disabled:opacity-50"
            >
              {isMoving ? "Moving..." : "Deploy Now"}
            </button>
            <button
              id="cancel-pending-btn"
              onClick={() => setIsEndModalOpen(true)}
              disabled={isSubmitting || isMoving}
              className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text-muted hover:bg-bg-light hover:cursor-pointer transition bg-bg disabled:opacity-50"
            >
              Cancel Session
            </button>
          </div>
        )}

        {isOnline && isActive && (
          <button
            id="pause-retract-btn"
            onClick={() => {
              setActionError(null);
              setIsPauseModalOpen(true);
            }}
            disabled={isSubmitting || isMoving}
            className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light hover:cursor-pointer transition bg-bg disabled:opacity-50"
          >
            {isMoving ? "Retracting..." : "Pause & Retract"}
          </button>
        )}

        {isOnline && isPausedOrInterrupted && (
          <div className="grid grid-cols-2 gap-3">
            <button
              id="resume-session-btn"
              onClick={() => withSubmit(onDeploy)}
              disabled={isSubmitting || isMoving || hasFault || isRaining}
              className="py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light hover:cursor-pointer transition bg-bg disabled:opacity-50"
            >
              {isMoving
                ? "Moving..."
                : isRaining
                  ? "Rain Active (Locked)"
                  : "Resume"}
            </button>
            <button
              id="end-session-btn"
              onClick={() => {
                setActionError(null);
                setIsEndModalOpen(true);
              }}
              disabled={isSubmitting || isMoving}
              className="py-2.5 rounded-md text-sm font-medium border border-border text-text-muted hover:bg-bg-light hover:cursor-pointer transition bg-bg disabled:opacity-50"
            >
              End Session
            </button>
          </div>
        )}
      </div>

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
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text hover:cursor-pointer text-sm transition"
            >
              Cancel
            </button>
            <button
              id="confirm-deploy-btn"
              onClick={handleConfirmStart}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-primary text-text font-medium hover:opacity-90 hover:cursor-pointer text-sm transition disabled:opacity-50"
            >
              {isSubmitting ? "Starting..." : "Start & Deploy"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        title="Pause Session"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            The clothesline will retract to the protected zone. Drying progress
            tracking will pause until resumed.
          </p>
          <div className="flex justify-end gap-3 mt-1">
            <button
              onClick={() => setIsPauseModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text hover:cursor-pointer text-sm transition"
            >
              Cancel
            </button>
            <button
              id="confirm-pause-btn"
              onClick={handleConfirmPause}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-warning text-bg-dark font-medium hover:opacity-90 hover:cursor-pointer text-sm transition disabled:opacity-50"
            >
              {isSubmitting ? "Pausing..." : "Pause & Retract"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        title="End Session"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to end this drying session? The session will
            be finalized and archived.
          </p>
          <div className="flex justify-end gap-3 mt-1">
            <button
              onClick={() => setIsEndModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text hover:cursor-pointer text-sm transition"
            >
              Cancel
            </button>
            <button
              id="confirm-end-btn"
              onClick={handleConfirmEnd}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-danger text-text font-medium hover:opacity-90 hover:cursor-pointer text-sm transition disabled:opacity-50"
            >
              {isSubmitting ? "Ending..." : "End Session"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ControlPanel;
