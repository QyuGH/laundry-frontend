import { useState, useEffect } from "react";
import { getPlan } from "../../services/api";

/**
 * Handles scheduling deployment and retraction events.
 *
 * @param {object} props
 * @param {object|null} props.session - The active session document data.
 * @param {object|null} props.schedule - The current schedule metadata.
 * @param {function} props.onSetSchedule - Request handler to create schedule.
 * @param {function} props.onCancelSchedule - Request handler to cancel schedule.
 * @returns {JSX.Element}
 */
function SchedulerSection({
  session,
  schedule,
  onSetSchedule,
  onCancelSchedule,
}) {
  const [deployTime, setDeployTime] = useState("");
  const [retractTime, setRetractTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fabricType, setFabricType] = useState("synthetic");
  const [fabricDuration, setFabricDuration] = useState(2);
  const [showDirectStartForm, setShowDirectStartForm] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!session) {
        if (!deployTime) {
          throw new Error(
            "Deployment time is required to queue a new session.",
          );
        }
        const deployIso = new Date(deployTime).toISOString();
        const retractIso = retractTime
          ? new Date(retractTime).toISOString()
          : null;

        await onSetSchedule({
          fabricType,
          fabricBaselineDuration: fabricDuration,
          deployTime: deployIso,
          retractTime: retractIso,
        });
        setShowDirectStartForm(false);
      } else {
        if (!retractTime) {
          throw new Error("Retraction time is required for active session.");
        }
        const retractIso = new Date(retractTime).toISOString();
        await onSetSchedule({
          deployTime: null,
          retractTime: retractIso,
        });
      }
      setDeployTime("");
      setRetractTime("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onCancelSchedule();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInactive = !session;
  const hasActiveSchedule = schedule && schedule.status === "pending";

  return (
    <div className="flex flex-col gap-4 p-5 rounded-lg border border-border-muted bg-glass-card h-full min-h-[220px]">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest font-semibold">
          Scheduler
        </span>
        {error && (
          <span className="text-text text-xs font-medium max-w-[60%] truncate">
            {error}
          </span>
        )}
      </div>

      <div className="flex flex-col justify-center flex-grow">
        {hasActiveSchedule ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 p-3 rounded border border-border-muted bg-bg text-sm">
              {schedule.deployTime && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Deploy:</span>
                  <span className="text-text font-medium">
                    {new Date(schedule.deployTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {schedule.retractTime && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Retract:</span>
                  <span className="text-text font-medium">
                    {new Date(schedule.retractTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full py-2 border border-border text-text-muted hover:text-text rounded text-xs transition disabled:opacity-50"
            >
              Cancel Schedule
            </button>
          </div>
        ) : isInactive && !showDirectStartForm ? (
          <button
            onClick={() => setShowDirectStartForm(true)}
            className="w-full py-2.5 rounded-md text-sm font-medium border border-border text-text hover:bg-bg-light transition bg-bg"
          >
            Schedule New Session
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {isInactive && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-text-muted tracking-wider">
                  Fabric Type
                </label>
                <select
                  value={fabricType}
                  onChange={handleFabricChange}
                  className="w-full p-2 text-xs rounded border border-border bg-bg-dark text-text"
                >
                  <option value="synthetic">Synthetic (2 hrs)</option>
                  <option value="blended">Blended (3 hrs)</option>
                  <option value="cotton">Cotton (4 hrs)</option>
                  <option value="heavy">Heavy/Thick (6 hrs)</option>
                </select>
              </div>
            )}

            {isInactive && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-text-muted tracking-wider">
                  Deploy Time
                </label>
                <input
                  type="datetime-local"
                  value={deployTime}
                  onChange={(e) => setDeployTime(e.target.value)}
                  className="w-full p-2 text-xs rounded border border-border bg-bg-dark text-text"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-text-muted tracking-wider">
                Retract Time
              </label>
              <input
                type="datetime-local"
                value={retractTime}
                onChange={(e) => setRetractTime(e.target.value)}
                className="w-full p-2 text-xs rounded border border-border bg-bg-dark text-text"
              />
            </div>

            <div className="flex gap-2 mt-1">
              {isInactive && (
                <button
                  type="button"
                  onClick={() => setShowDirectStartForm(false)}
                  className="flex-1 py-2 border border-border text-text-muted hover:text-text rounded text-xs transition"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 border border-border text-text hover:bg-bg-light rounded text-xs font-semibold transition disabled:opacity-50"
              >
                Save Schedule
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SchedulerSection;
