import { useState } from "react";
import {
  updateDeviceName,
  updateDeviceLocation,
  searchLocation,
} from "../../services/api";
import Modal from "../common/Modal";

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
      <div className="section-header pb-block border-b border-border-muted">
        <div>
          <h2 className="text-sm font-medium text-text">
            Device Configuration
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Settings for your connected motorized clothesline.
          </p>
        </div>
        <button
          onClick={handleOpenDeviceModal}
          className="inline-flex items-center gap-inline px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text-muted hover:text-text bg-surface-bg hover:bg-canvas-bg transition-colors duration-150 cursor-pointer shrink-0"
        >
          Edit Configuration
        </button>
      </div>

      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-block py-block">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-text">Device Name</span>
            <span className="text-xs text-text-muted">
              Label shown in the app.
            </span>
          </div>
          <span className="text-xs font-medium text-text text-right">
            {device?.name || "Not configured"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-block py-block border-t border-border-muted">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-text">Location</span>
            <span className="text-xs text-text-muted">
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
        <form onSubmit={handleSaveDevice} className="flex flex-col gap-block">
          {role === "owner" ? (
            <div className="flex flex-col gap-stack">
              <label className="text-xs uppercase tracking-widest text-text-muted font-medium">
                Device Name
              </label>
              <input
                type="text"
                value={editDevNameInput}
                onChange={(e) => setEditDevNameInput(e.target.value)}
                className="bg-canvas-bg border border-border-muted rounded-md px-3 py-2 text-text text-xs focus:outline-none focus:border-border transition"
                required
              />
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-widest text-text-muted font-medium">
                Device Name
              </span>
              <span className="text-xs font-medium text-text">
                {device?.name} (Read-Only)
              </span>
            </div>
          )}

          <div className="flex flex-col gap-stack pt-block border-t border-border-muted">
            <label className="text-xs uppercase tracking-widest text-text-muted font-medium">
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
                className="bg-canvas-bg border border-border-muted rounded-md px-3 py-2 text-text text-xs flex-1 focus:outline-none focus:border-border transition"
              />
              <button
                type="button"
                onClick={handleLocationSearch}
                disabled={isSearching}
                className="px-3 py-2 border border-border rounded-md text-xs font-semibold text-text-muted hover:text-text bg-surface-bg hover:bg-canvas-bg transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isSearching ? "..." : "Search"}
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <ul className="max-h-36 overflow-y-auto border border-border-muted rounded-md divide-y divide-border-muted/30 bg-canvas-bg">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedLocation(item);
                    setLocQuery(item.displayName);
                    setSuggestions([]);
                  }}
                  className="px-2.5 py-1.5 text-xs text-text-muted hover:text-text hover:bg-surface-bg cursor-pointer transition-colors"
                >
                  {item.displayName}
                </li>
              ))}
            </ul>
          )}

          {selectedLocation && (
            <div className="p-2.5 border border-border-muted rounded-md bg-canvas-bg text-xs text-text-muted">
              Selected: {selectedLocation.displayName}
            </div>
          )}

          {error && (
            <p className="text-danger text-xs border border-danger/20 rounded-md p-2.5 bg-danger/10 font-medium">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-block border-t border-border-muted">
            <button
              type="button"
              onClick={() => setIsDeviceModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text-muted hover:text-text bg-surface-bg hover:bg-canvas-bg transition-colors duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSaving ||
                (editDevNameInput.trim() === device?.name && !selectedLocation)
              }
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-canvas-bg bg-surface-bg transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
