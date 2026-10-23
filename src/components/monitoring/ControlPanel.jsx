import { useState, useCallback, useEffect } from "react";
import Modal from "../common/Modal";
import {
  Play,
  Pause,
  Power,
  WarningCircle,
  CheckCircle,
} from "@phosphor-icons/react";

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
        dotClass: "bg-neutral-400",
        label: "Connecting Device",
        description: "Checking hardware telemetry and connection status.",
      };
    }

    if (isOffline) {
      return {
        dotClass: "bg-danger",
        label: "Device Offline",
        description: "Device is disconnected. Ensure it is powered on.",
      };
    }

    if (hasFault) {
      return {
        dotClass: "bg-danger",
        label: "Motor Obstruction Alert",
        description: "Motor stopped: limit switch not reached. Inspect rack.",
      };
    }

    if (isMoving) {
      const isDeploying = pulleyPosition !== "drying-zone";
      return {
        dotClass: "bg-warning animate-pulse",
        label: isDeploying ? "Deploying Outdoors" : "Retracting Indoors",
        description: "Clothesline is moving to target position.",
      };
    }

    if (isRainInterrupted && isRaining) {
      return {
        dotClass: "bg-warning",
        label: "Rain Detected",
        description: "Clothesline retracted until weather clears.",
      };
    }

    if (isRainInterrupted && !isRaining) {
      return {
        dotClass: "bg-brand",
        label: "Rain Cleared",
        description: "Rain has cleared. Ready to resume drying.",
      };
    }

    if (isActive) {
      return {
        dotClass: "bg-brand",
        label: "Session Active",
        description:
          "Clothesline is deployed in the drying zone and actively drying.",
      };
    }

    if (isPaused) {
      return {
        dotClass: "bg-warning",
        label: "Session Paused",
        description:
          "Clothesline is retracted and the drying session is paused.",
      };
    }

    if (isPending) {
      return {
        dotClass: "bg-neutral-400",
        label: "Session Scheduled",
        description: "Session is waiting for its scheduled start time.",
      };
    }

    return {
      dotClass: "bg-success",
      label: "Device Ready",
      description: "Clothesline is idle and ready for a drying session.",
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
    <section className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col gap-5 flex-1">
      <div className="flex flex-col">
        <span className="text-xs font-bold tracking-widest text-brand uppercase font-display">
          Controls
        </span>
      </div>

      {/* Sub-Card: Current Status Notice */}
      <div className="rounded-lg border border-border bg-canvas/40 p-4.5 sm:p-5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusBadge.dotClass}`}
          />
          <span className="text-base font-bold font-display text-text">
            {statusBadge.label}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed pl-5">
          {statusBadge.description}
        </p>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-danger-soft text-danger text-xs font-medium">
          <WarningCircle className="w-4 h-4 shrink-0" weight="bold" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Control Actions Container */}
      <div className="flex flex-col gap-3 mt-auto pt-2">
        {isChecking && (
          <p className="text-text-muted text-xs italic text-center py-2">
            Verifying connection...
          </p>
        )}

        {isOffline && (
          <p className="text-danger text-xs font-medium text-center py-2">
            Device must be online to execute commands.
          </p>
        )}

        {/* 1. Inactive State: Initialize or Start Session */}
        {isOnline && isInactive && (
          <>
            {!isInitialized ? (
              <button
                id="initialize-device-btn"
                onClick={handleInitialize}
                disabled={isSubmitting || hasFault}
                className="w-full py-3 rounded-md text-sm font-semibold border border-border bg-surface text-text hover:bg-canvas transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
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
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-md bg-brand hover:bg-brand-600 text-white font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-interactive disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" weight="fill" />
                <span>Start Drying Session</span>
              </button>
            )}
          </>
        )}

        {/* 2. Pending Schedule State */}
        {isOnline && isPending && (
          <div className="flex flex-col gap-2.5">
            <button
              id="deploy-now-btn"
              onClick={() => withSubmit(onDeploy)}
              disabled={isSubmitting || isMoving || hasFault || isRaining}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-md bg-brand hover:bg-brand-600 text-white font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-interactive disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" weight="fill" />
              <span>{isMoving ? "Moving..." : "Deploy Now"}</span>
            </button>
            <button
              id="cancel-pending-btn"
              onClick={() => setIsEndModalOpen(true)}
              disabled={isSubmitting || isMoving}
              className="w-full py-2.5 rounded-md text-xs font-semibold border border-border text-text-muted hover:text-danger hover:bg-danger-soft transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel Session
            </button>
          </div>
        )}

        {/* 3. Active Session State: Pause & Retract */}
        {isOnline && isActive && (
          <button
            id="pause-retract-btn"
            onClick={() => {
              setActionError(null);
              setIsPauseModalOpen(true);
            }}
            disabled={isSubmitting || isMoving}
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-md border border-danger text-danger hover:bg-danger-soft text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
          >
            <Pause className="w-4 h-4" weight="bold" />
            <span>{isMoving ? "Retracting..." : "Pause & Retract"}</span>
          </button>
        )}

        {/* 4. Paused State: Resume & Deploy (Blue) OR End Session */}
        {isOnline && isPausedOrInterrupted && (
          <div className="flex flex-col gap-2.5">
            <button
              id="resume-session-btn"
              onClick={() => withSubmit(onDeploy)}
              disabled={isSubmitting || isMoving || hasFault || isRaining}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-md bg-brand hover:bg-brand-600 text-white font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-interactive disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" weight="fill" />
              <span>
                {isMoving
                  ? "Moving..."
                  : isRaining
                    ? "Rain Active (Locked)"
                    : "Resume & Deploy"}
              </span>
            </button>

            <button
              id="end-session-btn"
              onClick={() => {
                setActionError(null);
                setIsEndModalOpen(true);
              }}
              disabled={isSubmitting || isMoving}
              className="w-full py-2.5 rounded-md text-xs font-semibold border border-border text-text-muted hover:text-danger hover:bg-danger-soft transition-colors disabled:opacity-50 cursor-pointer"
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
        title="Start Drying Session"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted leading-relaxed">
            Select the primary fabric type to initialize telemetry and deploy
            the clothesline outdoors.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-brand font-display">
              Fabric Type
            </label>
            <select
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border border-border bg-canvas text-text text-sm font-medium focus:outline-none focus:border-brand transition-colors cursor-pointer"
            >
              <option value="synthetic">Synthetic (Est. 2 hrs)</option>
              <option value="blended">Blended (Est. 3 hrs)</option>
              <option value="cotton">Cotton (Est. 4 hrs)</option>
              <option value="heavy">Heavy / Thick (Est. 6 hrs)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-1">
            <button
              onClick={() => setIsStartModalOpen(false)}
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-deploy-btn"
              onClick={handleConfirmStart}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-brand hover:bg-brand-600 text-white font-semibold text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-interactive disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Starting..." : "Start & Deploy"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Pause Confirmation Modal */}
      <Modal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        title="Pause Drying Session"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted leading-relaxed">
            Clothesline will retract indoors and session progress will pause
            until resumed.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              onClick={() => setIsPauseModalOpen(false)}
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-pause-btn"
              onClick={handleConfirmPause}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md border border-warning text-warning hover:bg-warning-soft font-semibold text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Pausing..." : "Pause & Retract"}
            </button>
          </div>
        </div>
      </Modal>

      {/* End Session Confirmation Modal */}
      <Modal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        title="End Drying Session"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted leading-relaxed">
            This will finalize and archive the current drying session. The
            clothesline will return indoors.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              onClick={() => setIsEndModalOpen(false)}
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-end-btn"
              onClick={handleConfirmEnd}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-danger hover:bg-danger-600 text-white font-semibold text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-interactive cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Ending..." : "End Session"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default ControlPanel;
