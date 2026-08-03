import { useState } from "react";
import {
  updateDeviceName,
  updateDeviceLocation,
  searchLocation,
} from "../../services/api";
import Modal from "../common/Modal";

/**
 * Device configuration card.
 * Displays device name and location (human-readable only).
 * Owns the Edit Device Configuration modal with location search.
 *
 * @param {object} props
 * @param {object|null} props.device - Device document.
 * @param {string} props.role - "owner" or "member".
 * @param {function} props.onDeviceSaved - Callback after a successful save.
 * @returns {JSX.Element}
 */
function DeviceCard({ device, role, onDeviceSaved }) {
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [editDevNameInput, setEditDevNameInput] = useState("");
  const [locQuery, setLocQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenDeviceModal = () => {
    setEditDevNameInput(device?.name || "");
    setLocQuery(device?.locationName || "");
    setSelectedLocation(null);
    setSuggestions([]);
    setError(null);
    setIsDeviceModalOpen(true);
  };

  const handleLocationSearch = async () => {
    if (!locQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await searchLocation(locQuery);
      setSuggestions(res.results || []);
    } catch {
      setError("Failed to fetch location suggestions.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveDevice = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (editDevNameInput.trim() !== device?.name && role === "owner") {
        await updateDeviceName(editDevNameInput);
      }
      if (selectedLocation) {
        await updateDeviceLocation({
          locationName: selectedLocation.displayName,
          shortLocationName: selectedLocation.shortLocationName,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        });
      }
      setIsDeviceModalOpen(false);
      onDeviceSaved("Device configuration saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to update device settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="card-shell flex flex-col">
      <div className="section-header pb-[var(--gap-block)] border-b border-border-muted">
        <div>
          <h2 className="text-sm font-semibold text-text">
            Device Configuration
          </h2>
          <p className="text-[var(--text-micro)] text-text-muted mt-0.5">
            Settings for your connected motorized clothesline.
          </p>
        </div>
        <button
          onClick={handleOpenDeviceModal}
          className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg shrink-0"
        >
          Edit Configuration
        </button>
      </div>

      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-[var(--gap-block)] py-[var(--gap-block)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-text">Device Name</span>
            <span className="text-[var(--text-micro)] text-text-muted">
              Label shown in the app.
            </span>
          </div>
          <span className="text-xs font-medium text-text text-right">
            {device?.name || "Not configured"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-[var(--gap-block)] py-[var(--gap-block)] border-t border-border-muted/30">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-text">Location</span>
            <span className="text-[var(--text-micro)] text-text-muted">
              Used for local weather forecasts.
            </span>
          </div>
          <span className="text-xs font-medium text-text text-right">
            {device?.locationName || "No location configured"}
          </span>
        </div>
      </div>

      <Modal
        isOpen={isDeviceModalOpen}
        onClose={() => !isSaving && setIsDeviceModalOpen(false)}
        title="Edit Device Configuration"
      >
        <form
          onSubmit={handleSaveDevice}
          className="flex flex-col gap-[var(--gap-block)]"
        >
          {role === "owner" ? (
            <div className="flex flex-col gap-[var(--gap-stack)]">
              <label className="text-[var(--text-micro)] uppercase tracking-wider text-text-muted">
                Device Name
              </label>
              <input
                type="text"
                value={editDevNameInput}
                onChange={(e) => setEditDevNameInput(e.target.value)}
                className="bg-bg-dark border border-border-muted rounded-md px-3 py-2 text-text text-xs focus:outline-none focus:border-border transition"
                required
              />
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="text-[var(--text-micro)] uppercase tracking-wider text-text-muted">
                Device Name
              </span>
              <span className="text-xs font-medium text-text">
                {device?.name} (Read-Only)
              </span>
            </div>
          )}

          <div className="flex flex-col gap-[var(--gap-stack)] pt-[var(--gap-block)] border-t border-border-muted/30">
            <label className="text-[var(--text-micro)] uppercase tracking-wider text-text-muted">
              Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={locQuery}
                onChange={(e) => {
                  setLocQuery(e.target.value);
                  setSelectedLocation(null);
                }}
                placeholder="Search for a city or area..."
                className="bg-bg-dark border border-border-muted rounded-md px-3 py-2 text-text text-xs flex-1 focus:outline-none focus:border-border transition"
              />
              <button
                type="button"
                onClick={handleLocationSearch}
                disabled={isSearching}
                className="px-3 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg disabled:opacity-50"
              >
                {isSearching ? "..." : "Search"}
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <ul className="max-h-36 overflow-y-auto border border-border-muted rounded-md divide-y divide-border-muted/30 bg-bg-dark">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedLocation(item);
                    setLocQuery(item.displayName);
                    setSuggestions([]);
                  }}
                  className="px-2.5 py-1.5 text-[var(--text-micro)] text-text-muted hover:text-text hover:bg-bg-light/40 cursor-pointer transition-colors"
                >
                  {item.displayName}
                </li>
              ))}
            </ul>
          )}

          {selectedLocation && (
            <div className="p-2.5 border border-border-muted rounded-md bg-bg-dark text-[var(--text-micro)] text-text-muted">
              Selected: {selectedLocation.displayName}
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs border border-red-400/20 rounded p-2.5 bg-red-400/10 font-medium">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-[var(--gap-block)] border-t border-border-muted/30">
            <button
              type="button"
              onClick={() => setIsDeviceModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 border border-border-muted rounded-md text-xs font-semibold text-text hover:bg-bg-light transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSaving ||
                (editDevNameInput.trim() === device?.name && !selectedLocation)
              }
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default DeviceCard;
