import { useState } from "react";
import {
  updateDeviceName,
  updateDeviceLocation,
  searchLocation,
} from "../../services/api";
import Modal from "../common/Modal";
import {
  Broadcast,
  MapPin,
  ShieldCheck,
  Gear,
  MagnifyingGlass,
} from "@phosphor-icons/react";

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
      onDeviceSaved("Clothesline settings saved.");
    } catch (err) {
      setError(err.message || "Failed to update device settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
            Hardware
          </span>
          <h3 className="text-lg font-bold font-display text-text mt-0.5">
            Connected Clothesline
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Location and settings used for automated rain protection.
          </p>
        </div>

        <button
          onClick={handleOpenDeviceModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:text-brand hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Gear className="w-4 h-4" weight="bold" />
          <span>Edit Configuration</span>
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <Broadcast className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Clothesline Name
              </span>
              <span className="text-sm sm:text-base font-bold font-display text-text mt-0.5 truncate">
                {device?.name || "Main Clothesline"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Forecast Location
              </span>
              <span className="text-sm sm:text-base font-medium text-text mt-0.5 truncate">
                {device?.locationName || "Not configured"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Your Access Role
              </span>
              <span className="text-sm font-medium text-text-muted mt-0.5">
                {role === "owner"
                  ? "Full device administrator"
                  : "Standard household operator"}
              </span>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-pill text-xs font-bold font-display uppercase tracking-wider shrink-0 ${
              role === "owner"
                ? "bg-brand-soft text-brand"
                : "bg-canvas border border-border text-text-muted"
            }`}
          >
            {role === "owner" ? "Owner" : "Member"}
          </span>
        </div>
      </div>

      <Modal
        isOpen={isDeviceModalOpen}
        onClose={() => !isSaving && setIsDeviceModalOpen(false)}
        title="Update Clothesline Details"
      >
        <form onSubmit={handleSaveDevice} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-brand font-display mb-1.5">
              Clothesline Name
            </label>
            <input
              type="text"
              value={editDevNameInput}
              onChange={(e) => setEditDevNameInput(e.target.value)}
              disabled={role !== "owner"}
              className="w-full bg-canvas border border-border rounded-md px-3.5 py-2.5 text-text text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all disabled:opacity-50"
              required
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <label className="text-xs font-bold uppercase tracking-wider text-brand font-display">
              Change Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search city or municipality..."
                value={locQuery}
                onChange={(e) => setLocQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleLocationSearch())
                }
                className="flex-1 bg-canvas border border-border rounded-md px-3.5 py-2 text-text text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
              <button
                type="button"
                onClick={handleLocationSearch}
                disabled={isSearching || !locQuery.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-brand text-white hover:bg-brand-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MagnifyingGlass className="w-4 h-4" weight="bold" />
                <span>{isSearching ? "Searching..." : "Search"}</span>
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="flex flex-col divide-y divide-border border border-border rounded-md bg-canvas max-h-40 overflow-y-auto mt-1">
                {suggestions.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setLocQuery(loc.displayName);
                      setSuggestions([]);
                    }}
                    className="p-2.5 text-left text-xs text-text hover:bg-surface hover:text-brand transition-colors cursor-pointer"
                  >
                    {loc.displayName}
                  </button>
                ))}
              </div>
            )}

            {selectedLocation && (
              <div className="rounded-md border border-brand/30 bg-brand-soft p-3 mt-1 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                  Selected Location
                </span>
                <span className="text-xs font-bold font-display text-text">
                  {selectedLocation.displayName}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-2">
            <button
              type="button"
              onClick={() => setIsDeviceModalOpen(false)}
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold bg-brand text-white hover:bg-brand-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default DeviceCard;
