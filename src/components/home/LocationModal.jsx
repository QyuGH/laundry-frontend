import { useState } from "react";
import { searchLocation } from "../../services/api";

/**
 * Token-styled modal for searching and selecting a new location.
 */
function LocationModal({ isOpen, onClose, onSave }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const response = await searchLocation(query);
      setSuggestions(response.results || []);
    } catch (err) {
      setError("Failed to fetch location suggestions.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setQuery(item.displayName);
    setSuggestions([]);
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        locationName: selectedItem.displayName,
        shortLocationName: selectedItem.shortLocationName,
        latitude: selectedItem.latitude,
        longitude: selectedItem.longitude,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save device location.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-surface border border-border rounded-lg max-w-sm w-full p-6 shadow-elevated z-10 flex flex-col gap-4">
        <h3 className="text-text font-display text-base font-bold border-b border-border pb-3">
          Change Location
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedItem(null);
            }}
            placeholder="Search city, province..."
            className="bg-canvas border border-border rounded-md px-3 py-2 text-text text-sm flex-1 placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-3.5 py-2 bg-brand text-white rounded-md text-xs font-semibold hover:bg-brand-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSearching ? "..." : "Search"}
          </button>
        </div>

        {/* Suggestion list */}
        {suggestions.length > 0 && (
          <ul className="max-h-40 overflow-y-auto border border-border rounded-md bg-canvas divide-y divide-border">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(item)}
                className="px-3 py-2 text-xs text-text-muted hover:text-text hover:bg-surface cursor-pointer transition-colors"
              >
                {item.displayName}
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="text-xs text-center text-danger font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-2.5 mt-2 border-t border-border pt-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedItem}
            className="px-4 py-2 bg-brand text-white rounded-md text-xs font-semibold hover:bg-brand-600 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationModal;
