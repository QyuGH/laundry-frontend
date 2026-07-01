import { useState } from "react";
import { searchLocation } from "../../services/api";

/**
 * Modal to search and select a new location for the device.
 * Triggers Nominatim autocomplete geocode search.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 * @param {function} props.onSave - Callback receiving { locationName, latitude, longitude }.
 * @returns {JSX.Element|null}
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
        className="absolute inset-0 bg-bg-dark/80 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-bg border border-border rounded-lg max-w-sm w-full p-6 shadow-lg z-10 flex flex-col gap-4">
        <h3 className="text-text text-base font-semibold border-b border-border-muted pb-2">
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
            className="bg-transparent border border-border-muted rounded-md px-3 py-2 text-text text-sm flex-1 placeholder-text-muted focus:outline-none focus:border-border transition-colors duration-150"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-3 py-2 bg-bg-light border border-border rounded-md text-xs font-medium text-text hover:bg-highlight transition-colors duration-150"
          >
            Search
          </button>
        </div>

        {/* Suggestion list */}
        {suggestions.length > 0 && (
          <ul className="max-h-40 overflow-y-auto border border-border-muted rounded-md bg-bg divide-y divide-border-muted/30">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(item)}
                className="px-3 py-2 text-xs text-text-muted hover:text-text hover:bg-bg-light cursor-pointer transition-colors"
              >
                {item.displayName}
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="text-xs text-center text-text-muted">{error}</p>
        )}

        <div className="flex justify-end gap-2.5 mt-2 border-t border-border-muted pt-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-border-muted rounded-md text-xs font-medium text-text hover:bg-bg-light transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedItem}
            className="px-4 py-2 bg-bg-light border border-border rounded-md text-xs font-medium text-text hover:bg-highlight transition-colors duration-150 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationModal;
