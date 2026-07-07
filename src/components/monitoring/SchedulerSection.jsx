import { useState } from "react";
import Modal from "../common/Modal";

/**
 * Renders the scheduling controller for manual/scheduled deployments and retractions.
 * Prevents text entry using a custom dropdown time picker that targets today only.
 * Disables scheduling options entirely when the session is paused or interrupted.
 *
 * @param {object} props
 * @param {object|null} props.session - The active session document data.
 * @param {object|null} props.schedule - The active schedule subdocument.
 * @param {string} props.deviceConnection - The device connection state string ("checking"|"online"|"offline").
 * @param {function} props.onSetSchedule - Callback to register a new schedule.
 * @param {function} props.onCancelSchedule - Callback to delete the active schedule.
 * @returns {JSX.Element}
 */
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
      setMinute(mins);
      setPeriod(ampm);
    } else {
      setHour("08");
      setMinute("00");
      setPeriod("AM");
    }
    setIsScheduleModalOpen(true);
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

  const minutes = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0"),
  );

  return (
    <div className="flex flex-col gap-4 p-5 rounded-lg border border-border-muted bg-glass-card h-full min-h-[220px]">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest font-semibold">
          Scheduler
        </span>
      </div>

      <div className="flex flex-col justify-center flex-grow">
        {/* Case 1: Device is Offline */}
        {!isOnline && (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-text-muted text-xs leading-relaxed italic">
              Scheduler is unavailable because the device is offline.
            </p>
            <button
              disabled
              className="w-full py-2.5 rounded-md text-sm font-medium border border-border-muted text-text-muted bg-bg/50 cursor-not-allowed opacity-50"
            >
              Device Offline
            </button>
          </div>
        )}

        {/* Case 2: Device is Online, but Session is Paused or Rain-Interrupted */}
        {isOnline && isPausedOrInterrupted && (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-text-muted text-xs leading-relaxed italic">
              Scheduling is unavailable while the drying session is paused or
              interrupted by rain.
            </p>
            <button
              disabled
              className="w-full py-2.5 rounded-md text-sm font-medium border border-border-muted text-text-muted bg-bg/50 cursor-not-allowed opacity-50"
            >
              Set Schedule
            </button>
          </div>
        )}

        {/* Case 3: Device is Online, Active Schedule exists (either Pending Deployment OR Pending Retraction) */}
        {isOnline && !isPausedOrInterrupted && hasActiveSchedule && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-center">
              <p className="text-text text-sm font-medium">
                {schedule.deployTime
                  ? `Deployment scheduled for ${new Date(
                      schedule.deployTime,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} Today`
                  : `Retraction scheduled for ${new Date(
                      schedule.retractTime,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} Today`}
              </p>
              {schedule.retractTime && (
                <p className="text-text-muted text-[10px] italic mt-1 px-4 leading-normal">
                  Note: At the scheduled time, the clothesline will retract and
                  end this session.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                id="modify-schedule-btn"
                onClick={handleOpenScheduleModal}
                disabled={isSubmitting}
                className="py-2 rounded-md text-xs font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
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
                className="py-2 rounded-md text-xs font-medium border border-border text-text-muted hover:bg-bg-light transition bg-bg disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Case 4: Device is Online, No Active Schedule, and Deployment is pending (session exists as pending) */}
        {isOnline &&
          !isPausedOrInterrupted &&
          !hasActiveSchedule &&
          isPending && (
            <div className="flex flex-col gap-3 text-center">
              <p className="text-text-muted text-xs leading-relaxed italic">
                A session is pending deployment. Retraction times cannot be
                scheduled until the session starts.
              </p>
              <button
                disabled
                className="w-full py-2.5 rounded-md text-sm font-medium border border-border-muted text-text-muted bg-bg/50 cursor-not-allowed opacity-50"
              >
                Session Pending Start
              </button>
            </div>
          )}

        {/* Case 5: Device is Online, No Active Schedule, and Session is either Inactive (Set Deployment) or Active (Set Retraction) */}
        {isOnline &&
          !isPausedOrInterrupted &&
          !hasActiveSchedule &&
          !isPending && (
            <div className="flex flex-col gap-3 text-center">
              <p className="text-text-muted text-xs leading-relaxed italic">
                {isInactive
                  ? "No active schedule. Set a deployment time to automate your laundry session today."
                  : "No active schedule. Set a retraction time to automatically bring in your clothes today."}
              </p>
              <button
                id="set-schedule-btn"
                onClick={handleOpenScheduleModal}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
              >
                {isInactive ? "Set Deployment Time" : "Set Retraction Time"}
              </button>
            </div>
          )}
      </div>

      {/* Dropdown Time Picker Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={isInactive ? "Set Deployment Time" : "Set Retraction Time"}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            {isInactive
              ? "Choose what time you want the clothesline to deploy. The session will assume synthetic fabric tracking."
              : "Choose what time you want the clothesline to automatically retract and end the session."}
          </p>

          <div className="flex justify-center items-center gap-2 py-4">
            {/* Hour select */}
            <select
              id="picker-hour"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="p-2 rounded border border-border bg-bg-dark text-text text-lg font-semibold w-16 text-center"
            >
              {Array.from({ length: 12 }, (_, i) =>
                String(i + 1).padStart(2, "0"),
              ).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <span className="text-xl font-bold text-text">:</span>

            {/* Minute select */}
            <select
              id="picker-minute"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="p-2 rounded border border-border bg-bg-dark text-text text-lg font-semibold w-16 text-center"
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* AM/PM select */}
            <select
              id="picker-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="p-2 rounded border border-border bg-bg-dark text-text text-lg font-semibold w-16 text-center ml-2"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center font-medium border border-red-400/20 rounded p-2 bg-red-400/10">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-1">
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text text-sm transition"
            >
              Cancel
            </button>
            <button
              id="confirm-schedule-btn"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Schedule Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Schedule"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to cancel this schedule? This action cannot be
            undone.
          </p>

          {error && (
            <p className="text-red-400 text-xs text-center font-medium border border-red-400/20 rounded p-2 bg-red-400/10">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-text-muted hover:text-text text-sm transition"
            >
              Go Back
            </button>
            <button
              id="confirm-cancel-schedule-btn"
              onClick={handleConfirmCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-border rounded text-text hover:bg-bg-light text-sm font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SchedulerSection;
