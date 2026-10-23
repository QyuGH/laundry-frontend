import { useState, useRef } from "react";
import Modal from "../common/Modal";
import {
  CalendarBlank,
  CalendarCheck,
  WarningCircle,
  Pause,
  Clock,
} from "@phosphor-icons/react";

function SchedulerSection({
  session,
  schedule,
  deviceConnection,
  onSetSchedule,
  onCancelSchedule,
}) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const minuteRef = useRef(null);
  const hourValueRef = useRef("08");

  const isOnline = deviceConnection === "online";
  const isInactive = !session;
  const isPending = session?.status === "pending";
  const isPausedOrInterrupted =
    session?.status === "paused" || session?.status === "rain-interrupted";
  const hasActiveSchedule = schedule && schedule.status === "pending";

  const handleOpenScheduleModal = () => {
    setError(null);
    let targetTime = null;

    if (hasActiveSchedule) {
      targetTime = schedule.deployTime || schedule.retractTime;
    }

    if (targetTime) {
      const dateObj = new Date(targetTime);
      let hours = dateObj.getHours();
      const mins = String(dateObj.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? String(hours).padStart(2, "0") : "12";

      setHour(hours);
      hourValueRef.current = hours;
      setMinute(mins);
      setPeriod(ampm);
    } else {
      setHour("08");
      hourValueRef.current = "08";
      setMinute("00");
      setPeriod("AM");
    }
    setIsScheduleModalOpen(true);
  };

  const handleHourChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setHour(val);
    hourValueRef.current = val;
    if (val.length === 2) {
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleHourBlur = () => {
    let num = parseInt(hourValueRef.current, 10);
    if (isNaN(num) || num < 1) num = 12;
    if (num > 12) num = 12;
    const padded = String(num).padStart(2, "0");
    setHour(padded);
    hourValueRef.current = padded;
  };

  const handleMinuteChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMinute(val);
  };

  const handleMinuteBlur = () => {
    let num = parseInt(minute, 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 59) num = 59;
    setMinute(String(num).padStart(2, "0"));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      let numHours = parseInt(hour, 10);
      const numMinutes = parseInt(minute, 10);

      if (period === "PM" && numHours !== 12) numHours += 12;
      if (period === "AM" && numHours === 12) numHours = 0;

      const targetDate = new Date();
      targetDate.setHours(numHours, numMinutes, 0, 0);

      const now = Date.now();
      if (targetDate.getTime() <= now) {
        throw new Error("Selected time must be a future time today.");
      }

      const targetIsoString = targetDate.toISOString();

      if (isInactive) {
        await onSetSchedule({
          fabricType: "synthetic",
          fabricBaselineDuration: 2,
          deployTime: targetIsoString,
          retractTime: null,
        });
      } else {
        await onSetSchedule({
          deployTime: null,
          retractTime: targetIsoString,
        });
      }
      setIsScheduleModalOpen(false);
    } catch (err) {
      setError(err.message || "Failed to set schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onCancelSchedule();
      setIsCancelModalOpen(false);
    } catch (err) {
      setError(err.message || "Failed to cancel schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBlock = (() => {
    if (!isOnline) {
      return {
        Icon: WarningCircle,
        iconClass: "text-danger",
        label: "Device Offline",
        description: "Scheduler unavailable. Ensure the device is powered on.",
      };
    }
    if (isPausedOrInterrupted) {
      return {
        Icon: Pause,
        iconClass: "text-warning",
        label: "Session Paused",
        description:
          "Scheduling is disabled while the session is paused or interrupted by rain.",
      };
    }
    if (isPending && !hasActiveSchedule) {
      return {
        Icon: Clock,
        iconClass: "text-text-muted",
        label: "Session Pending",
        description: "Retraction can be scheduled once the session starts.",
      };
    }
    if (hasActiveSchedule) {
      const time = schedule.deployTime || schedule.retractTime;
      const formatted = new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        Icon: CalendarCheck,
        iconClass: "text-brand",
        labelClass: "text-brand",
        label: formatted,
        description: schedule.deployTime
          ? "Clothesline deploys automatically at this time."
          : "Clothesline retracts automatically at this time.",
      };
    }
    return {
      Icon: CalendarBlank,
      iconClass: "text-text-muted",
      label: isInactive ? "No deployment set" : "No retraction set",
      description: isInactive
        ? "Automate today's session by setting a deployment time."
        : "Set a retraction time to automatically bring in your clothes.",
    };
  })();

  const { Icon } = statusBlock;

  return (
    <section className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col gap-5 flex-1">
      <div className="flex flex-col">
        <span className="text-xs font-bold tracking-widest text-brand uppercase font-display">
          Scheduler
        </span>
      </div>

      <div className="rounded-lg border border-border bg-canvas/40 p-4.5 sm:p-5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <Icon
            className={`w-4.5 h-4.5 shrink-0 ${statusBlock.iconClass}`}
            weight="bold"
          />
          <span
            className={`text-base font-bold font-display ${statusBlock.labelClass ?? "text-text"}`}
          >
            {statusBlock.label}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed pl-7">
          {statusBlock.description}
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-2">
        {!isOnline && (
          <button
            disabled
            className="w-full py-3 rounded-md text-sm font-semibold border border-border-muted text-text-muted cursor-not-allowed opacity-50"
          >
            Device Offline
          </button>
        )}

        {isOnline && isPausedOrInterrupted && (
          <button
            disabled
            className="w-full py-3 rounded-md text-sm font-semibold border border-border-muted text-text-muted cursor-not-allowed opacity-50"
          >
            Scheduling Disabled
          </button>
        )}

        {isOnline && isPending && !hasActiveSchedule && (
          <button
            disabled
            className="w-full py-3 rounded-md text-sm font-semibold border border-border-muted text-text-muted cursor-not-allowed opacity-50"
          >
            Session Pending Start
          </button>
        )}

        {isOnline && !isPausedOrInterrupted && hasActiveSchedule && (
          <div className="flex flex-col gap-2.5">
            <button
              id="modify-schedule-btn"
              onClick={handleOpenScheduleModal}
              disabled={isSubmitting}
              className="w-full py-3 rounded-md border border-border bg-surface text-text text-sm font-semibold hover:bg-canvas transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              Edit Time
            </button>
            <button
              id="cancel-schedule-btn"
              onClick={() => {
                setError(null);
                setIsCancelModalOpen(true);
              }}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-md text-xs font-semibold border border-border text-text-muted hover:text-danger hover:bg-danger-soft transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel Schedule
            </button>
          </div>
        )}

        {isOnline &&
          !isPausedOrInterrupted &&
          !hasActiveSchedule &&
          !isPending && (
            <button
              id="set-schedule-btn"
              onClick={handleOpenScheduleModal}
              disabled={isSubmitting}
              className="w-full py-3 rounded-md border border-border bg-surface text-text text-sm font-semibold hover:bg-canvas transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              {isInactive ? "Set Deployment Time" : "Set Retraction Time"}
            </button>
          )}
      </div>

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={isInactive ? "Set Deployment Time" : "Set Retraction Time"}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted leading-relaxed">
            {isInactive
              ? "Choose a time for the clothesline to deploy automatically today."
              : "Choose a time for the clothesline to retract and end the session today."}
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              <input
                id="picker-hour"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={hour}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                onFocus={(e) => e.target.select()}
                className="w-20 py-3 text-center text-2xl font-bold font-display text-text bg-canvas border border-border rounded-md focus:outline-none focus:border-brand transition-colors"
              />
              <span className="text-2xl font-bold text-text-muted select-none">
                :
              </span>
              <input
                id="picker-minute"
                ref={minuteRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={minute}
                onChange={handleMinuteChange}
                onBlur={handleMinuteBlur}
                onFocus={(e) => e.target.select()}
                className="w-20 py-3 text-center text-2xl font-bold font-display text-text bg-canvas border border-border rounded-md focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeriod("AM")}
                className={`py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                  period === "AM"
                    ? "bg-brand text-white shadow-interactive"
                    : "border border-border text-text-muted hover:bg-canvas"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod("PM")}
                className={`py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                  period === "PM"
                    ? "bg-brand text-white shadow-interactive"
                    : "border border-border text-text-muted hover:bg-canvas"
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-danger-soft text-danger text-xs font-medium">
              <WarningCircle className="w-4 h-4 shrink-0" weight="bold" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-1">
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-schedule-btn"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-brand hover:bg-brand-600 text-white font-semibold text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-interactive disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Schedule"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted leading-relaxed">
            The scheduled time will be removed. The clothesline won't
            auto-deploy or retract.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-danger-soft text-danger text-xs font-medium">
              <WarningCircle className="w-4 h-4 shrink-0" weight="bold" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
            >
              Go Back
            </button>
            <button
              id="confirm-cancel-schedule-btn"
              onClick={handleConfirmCancel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-danger hover:bg-danger-600 text-white font-semibold text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-interactive cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default SchedulerSection;
