import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/common/Modal";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import {
  getDevice,
  updateDeviceName,
  updateDeviceLocation,
  searchLocation,
  getDeviceMembers,
  addDeviceMember,
  removeDeviceMember,
  updateProfile,
} from "../services/api";

/**
 * Simple SVG Eye icon component.
 * @returns {JSX.Element}
 */
function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

/**
 * Simple SVG Eye Slash icon component.
 * @returns {JSX.Element}
 */
function EyeSlashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

/**
 * Account Settings page.
 * Displays user profile details, links to device configuration, and device members.
 * Supports updating passwords, adding members, and coordinate selections.
 *
 * @returns {JSX.Element}
 */
function SettingsPage() {
  const { user } = useAuth();

  // App settings state
  const [profileName, setProfileName] = useState(user?.displayName || "");
  const [device, setDevice] = useState(null);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState("member");

  // Loading, success and error messages
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Modals open states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Edit forms inputs
  const [editNameInput, setEditNameInput] = useState("");
  const [editDevNameInput, setEditDevNameInput] = useState("");

  // Geocode location search states
  const [locQuery, setLocQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Member form inputs
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberConfirmPassword, setNewMemberConfirmPassword] = useState("");

  // Change Password inputs
  const [curPassword, setCurPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility states
  const [showCurPassword, setShowCurPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [showMemberConfirmPassword, setShowMemberConfirmPassword] =
    useState(false);

  // Transaction submission states
  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial profile, device, and member lists
  const fetchSettingsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const devRes = await getDevice();
      if (devRes && devRes.device) {
        setDevice(devRes.device);
        setEditDevNameInput(devRes.device.name);
        setRole(devRes.device.ownerId === user?.uid ? "owner" : "member");
      }

      const memRes = await getDeviceMembers();
      if (memRes && memRes.members) {
        setMembers(memRes.members);
      }
    } catch (err) {
      setError(err.message || "Failed to load account settings.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettingsData();
  }, [fetchSettingsData]);

  // Open modal handlers
  const handleOpenProfileModal = () => {
    setEditNameInput(profileName);
    setIsProfileModalOpen(true);
  };

  const handleOpenDeviceModal = () => {
    setEditDevNameInput(device?.name || "");
    setLocQuery(device?.locationName || "");
    setSelectedLocation(null);
    setSuggestions([]);
    setIsDeviceModalOpen(true);
  };

  const handleOpenPasswordModal = () => {
    setCurPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordModalOpen(true);
  };

  // Submit Profile update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editNameInput.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile(editNameInput);
      setProfileName(editNameInput.trim());
      setIsProfileModalOpen(false);
      triggerSuccessToast("Profile display name updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile name.");
    } finally {
      setIsSaving(false);
    }
  };

  // Search Location suggestions
  const handleLocationSearch = async () => {
    if (!locQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await searchLocation(locQuery);
      setSuggestions(res.results || []);
    } catch (err) {
      setError("Failed to fetch location suggestions.");
    } finally {
      setIsSearching(false);
    }
  };

  // Submit Device and Location details
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

      await fetchSettingsData();
      setIsDeviceModalOpen(false);
      triggerSuccessToast("Device configuration saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to update device settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Validates if password meets rules: length >= 8 and contains at least 1 number
  const validatePasswordSecurity = (pwd) => {
    return pwd.length >= 8 && /\d/.test(pwd);
  };

  // Submit password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!curPassword || !newPassword || !confirmPassword) return;

    if (!validatePasswordSecurity(newPassword)) {
      setError(
        "New password must be at least 8 characters and contain at least one number.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const activeUser = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        activeUser.email,
        curPassword,
      );

      await reauthenticateWithCredential(activeUser, credential);
      await updatePassword(activeUser, newPassword);

      setIsPasswordModalOpen(false);
      triggerSuccessToast("Account password updated successfully.");
    } catch (err) {
      setError(
        err.message ||
          "Failed to change password. Please verify current credentials.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Submit adding member (Owner only)
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (
      !newMemberName ||
      !newMemberEmail ||
      !newMemberPassword ||
      !newMemberConfirmPassword
    )
      return;

    if (!validatePasswordSecurity(newMemberPassword)) {
      setError(
        "Member password must be at least 8 characters and contain at least one number.",
      );
      return;
    }

    if (newMemberPassword !== newMemberConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await addDeviceMember({
        name: newMemberName,
        email: newMemberEmail,
        password: newMemberPassword,
      });

      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberPassword("");
      setNewMemberConfirmPassword("");

      await fetchSettingsData();
      setIsMemberModalOpen(false);
      triggerSuccessToast("New member registered successfully.");
    } catch (err) {
      setError(err.message || "Failed to add member.");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit removing member (Owner only)
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsSaving(true);
    setError(null);
    try {
      await removeDeviceMember(memberToRemove.userId);
      await fetchSettingsData();
      setMemberToRemove(null);
      triggerSuccessToast("Member unlinked successfully.");
    } catch (err) {
      setError(err.message || "Failed to remove member.");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerSuccessToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="p-5 md:p-6 bg-bg-dark min-h-full flex items-center justify-center">
        <p className="text-text-muted text-xs italic">
          Loading profile settings...
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-6 bg-bg-dark min-h-full flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {successMsg && (
          <div className="p-3 border border-green-500/20 bg-green-500/10 text-green-400 rounded-md text-xs font-medium">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-400 rounded-md text-xs font-medium">
            {error}
          </div>
        )}

        {/* PROFILE CARD */}
        <section className="bg-glass-card border border-border-muted rounded-lg p-5 md:p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-border-muted/30">
            <div>
              <h2 className="text-text text-sm font-semibold">
                Personal Profile
              </h2>
              <p className="text-text-muted text-[11px] mt-0.5">
                Manage your personal settings details.
              </p>
            </div>
            <button
              onClick={handleOpenProfileModal}
              className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg"
            >
              Edit Profile
            </button>
          </div>

          <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="md:col-span-1 flex flex-col">
                <span className="text-xs font-medium text-text">Name</span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">
                  Used across notifications.
                </span>
              </div>
              <div className="md:col-span-2 text-xs text-text font-medium flex items-center md:pl-4">
                {profileName}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-border-muted/20">
              <div className="md:col-span-1 flex flex-col">
                <span className="text-xs font-medium text-text">
                  Email Address
                </span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">
                  Primary login credential.
                </span>
              </div>
              <div className="md:col-span-2 text-xs text-text-muted/70 flex items-center md:pl-4">
                {user?.email}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-border-muted/20">
              <div className="md:col-span-1 flex flex-col">
                <span className="text-xs font-medium text-text">
                  Account Password
                </span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">
                  Modify account credentials.
                </span>
              </div>
              <div className="md:col-span-2 flex items-center md:pl-4">
                <button
                  onClick={handleOpenPasswordModal}
                  className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* DEVICE SETTINGS CARD */}
        <section className="bg-glass-card border border-border-muted rounded-lg p-5 md:p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-border-muted/30">
            <div>
              <h2 className="text-text text-sm font-semibold">
                Device Configuration
              </h2>
              <p className="text-text-muted text-[11px] mt-0.5">
                Settings for your connected motorized clothesline.
              </p>
            </div>
            <button
              onClick={handleOpenDeviceModal}
              className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg"
            >
              Edit Configuration
            </button>
          </div>

          <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="md:col-span-1 flex flex-col">
                <span className="text-xs font-medium text-text">
                  Device Name
                </span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">
                  Display label of physical device.
                </span>
              </div>
              <div className="md:col-span-2 text-xs text-text font-medium flex items-center md:pl-4">
                {device?.name || "Not Configured"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-border-muted/20">
              <div className="md:col-span-1 flex flex-col">
                <span className="text-xs font-medium text-text">
                  Geographic Location
                </span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">
                  Coordinates for regional forecast.
                </span>
              </div>
              <div className="md:col-span-2 text-xs text-text font-medium flex flex-col justify-center md:pl-4 gap-1">
                <p>{device?.locationName || "No location configured"}</p>
                {device?.latitude && device?.longitude && (
                  <p className="text-[10px] text-text-muted/60">
                    {Number(device.latitude).toFixed(4)}° N,{" "}
                    {Number(device.longitude).toFixed(4)}° E
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* DEVICE MEMBERS LIST */}
        <section className="bg-glass-card border border-border-muted rounded-lg p-5 md:p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-border-muted/30 mb-4">
            <div>
              <h2 className="text-text text-sm font-semibold">
                Device Members
              </h2>
              <p className="text-text-muted text-[11px] mt-0.5">
                {role === "owner"
                  ? "Manage members who have access to this device."
                  : "View members who share access to this device."}
              </p>
            </div>
            {role === "owner" && (
              <button
                onClick={() => {
                  setNewMemberName("");
                  setNewMemberEmail("");
                  setNewMemberPassword("");
                  setNewMemberConfirmPassword("");
                  setShowMemberPassword(false);
                  setShowMemberConfirmPassword(false);
                  setIsMemberModalOpen(true);
                }}
                className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg"
              >
                Add Member
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 border border-border-muted/40 rounded-lg bg-bg-dark/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-highlight/20 border border-highlight/30 flex items-center justify-center text-highlight font-semibold text-xs shrink-0">
                    {getInitials(member.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text">
                      {member.name}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {member.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {member.role === "owner" ? (
                    <span className="border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                      Owner
                    </span>
                  ) : (
                    <span className="border border-border-muted bg-white/5 text-text-muted text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                      Member
                    </span>
                  )}

                  {role === "owner" && member.role === "member" && (
                    <button
                      onClick={() => setMemberToRemove(member)}
                      className="text-text-muted hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                      title="Remove Member"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => !isSaving && setIsProfileModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-text-muted">
              Display Name
            </label>
            <input
              type="text"
              value={editNameInput}
              onChange={(e) => setEditNameInput(e.target.value)}
              className="bg-bg-dark border border-border-muted rounded-md px-3 py-2 text-text text-xs focus:outline-none focus:border-border transition"
              required
            />
          </div>

          <div className="flex flex-col gap-1 text-[11px] text-text-muted/60 mt-1">
            <p>
              Email: <span className="text-text-muted/80">{user?.email}</span>
            </p>
            <p className="italic">
              Note: Your email address cannot be changed from this profile
              editor.
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border-muted/20">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 border border-border-muted rounded-md text-xs font-semibold text-text hover:bg-bg-light transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSaving ||
                !editNameInput.trim() ||
                editNameInput.trim() === profileName
              }
              className="px-4 py-2 bg-bg-light border border-border rounded-md text-xs font-semibold text-text hover:bg-highlight transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT DEVICE CONFIGURATION MODAL */}
      <Modal
        isOpen={isDeviceModalOpen}
        onClose={() => !isSaving && setIsDeviceModalOpen(false)}
        title="Edit Device Configuration"
      >
        <form onSubmit={handleSaveDevice} className="flex flex-col gap-4">
          {role === "owner" ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider text-text-muted">
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
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-text-muted">
                Device Name
              </span>
              <span className="text-xs text-text font-medium">
                {device?.name} (Read-Only)
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1.5 border-t border-border-muted/20 pt-3">
            <label className="text-[11px] uppercase tracking-wider text-text-muted">
              Search New Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={locQuery}
                onChange={(e) => {
                  setLocQuery(e.target.value);
                  setSelectedLocation(null);
                }}
                placeholder="Search city, coordinates..."
                className="bg-bg-dark border border-border-muted rounded-md px-3 py-2 text-text text-xs flex-1 focus:outline-none focus:border-border transition"
              />
              <button
                type="button"
                onClick={handleLocationSearch}
                disabled={isSearching}
                className="px-3 py-2 bg-bg-light border border-border rounded-md text-xs font-semibold text-text hover:bg-highlight transition"
              >
                Search
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <ul className="max-h-36 overflow-y-auto border border-border-muted rounded-md divide-y divide-border-muted/30 bg-bg-dark/40">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedLocation(item);
                    setLocQuery(item.displayName);
                    setSuggestions([]);
                  }}
                  className="px-2.5 py-1.5 text-[11px] text-text-muted hover:text-text hover:bg-bg-light/40 cursor-pointer transition-colors"
                >
                  {item.displayName}
                </li>
              ))}
            </ul>
          )}

          {selectedLocation && (
            <div className="p-2 border border-highlight/20 bg-highlight/5 rounded text-[10px] text-highlight/90 font-medium">
              Selected Location Coordinate:{" "}
              {Number(selectedLocation.latitude).toFixed(4)}°,{" "}
              {Number(selectedLocation.longitude).toFixed(4)}°
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border-muted/20">
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
              className="px-4 py-2 bg-bg-light border border-border rounded-md text-xs font-semibold text-text hover:bg-highlight transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => !isSaving && setIsPasswordModalOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-text-muted">
              Current Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showCurPassword ? "text" : "password"}
                value={curPassword}
                onChange={(e) => setCurPassword(e.target.value)}
                required
                className="w-full bg-bg-dark border border-border-muted rounded-md pl-3 pr-10 py-2 text-text text-xs focus:outline-none focus:border-border transition"
              />
              <button
                type="button"
                onClick={() => setShowCurPassword((p) => !p)}
                className="absolute right-3 text-white/30 hover:text-white/60 focus:outline-none transition"
              >
                {showCurPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-border-muted/20 pt-3">
            <label className="text-[11px] uppercase tracking-wider text-text-muted">
              New Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-bg-dark border border-border-muted rounded-md pl-3 pr-10 py-2 text-text text-xs focus:outline-none focus:border-border transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                className="absolute right-3 text-white/30 hover:text-white/60 focus:outline-none transition"
              >
                {showNewPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-text-muted">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-bg-dark border border-border-muted rounded-md pl-3 pr-10 py-2 text-text text-xs focus:outline-none focus:border-border transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 text-white/30 hover:text-white/60 focus:outline-none transition"
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border-muted/20">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 border border-border-muted rounded-md text-xs font-semibold text-text hover:bg-bg-light transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSaving ||
                !curPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                !validatePasswordSecurity(newPassword)
              }
              className="px-4 py-2 bg-bg-light border border-border rounded-md text-xs font-semibold text-text hover:bg-highlight transition disabled:opacity-50"
            >
              {isSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD MEMBER MODAL */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => !isSaving && setIsMemberModalOpen(false)}
        title="Add Device Member"
      >
        <form onSubmit={handleAddMember} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-text-muted">
              Member Name
            </label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Full Name"
              className="bg-bg-dark border border-border-muted rounded-md px-3 py-2 text-text text-xs focus:outline-none focus:border-border transition"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-text-muted">
              Email Address
            </label>
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="email@example.com"
              className="bg-bg-dark border border-border-muted rounded-md px-3 py-2 text-text text-xs focus:outline-none focus:border-border transition"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-text-muted">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showMemberPassword ? "text" : "password"}
                value={newMemberPassword}
                onChange={(e) => setNewMemberPassword(e.target.value)}
                placeholder="Minimum 8 characters with 1 number"
                className="w-full bg-bg-dark border border-border-muted pl-3 pr-10 py-2 text-text text-xs focus:outline-none focus:border-border transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowMemberPassword((p) => !p)}
                className="absolute right-3 text-white/30 hover:text-white/60 focus:outline-none transition"
              >
                {showMemberPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-text-muted">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showMemberConfirmPassword ? "text" : "password"}
                value={newMemberConfirmPassword}
                onChange={(e) => setNewMemberConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-bg-dark border border-border-muted pl-3 pr-10 py-2 text-text text-xs focus:outline-none focus:border-border transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowMemberConfirmPassword((p) => !p)}
                className="absolute right-3 text-white/30 hover:text-white/60 focus:outline-none transition"
              >
                {showMemberConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border-muted/20">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 border border-border-muted rounded-md text-xs font-semibold text-text hover:bg-bg-light transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSaving ||
                !newMemberName ||
                !newMemberEmail ||
                !newMemberPassword ||
                newMemberPassword !== newMemberConfirmPassword ||
                !validatePasswordSecurity(newMemberPassword)
              }
              className="px-4 py-2 bg-bg-light border border-border rounded-md text-xs font-semibold text-text hover:bg-highlight transition disabled:opacity-50"
            >
              {isSaving ? "Registering..." : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM REMOVE MEMBER MODAL */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => !isSaving && setMemberToRemove(null)}
        title="Remove Member"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-muted text-xs leading-normal">
            Are you sure you want to remove{" "}
            <span className="text-text font-semibold">
              {memberToRemove?.name}
            </span>
            ? They will lose device access immediately and will no longer
            receive system update notifications.
          </p>

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-border-muted/20">
            <button
              onClick={() => setMemberToRemove(null)}
              disabled={isSaving}
              className="px-4 py-2 border border-border-muted rounded-md text-xs font-semibold text-text hover:bg-bg-light transition"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveMember}
              disabled={isSaving}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-md text-xs font-semibold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
            >
              {isSaving ? "Removing..." : "Confirm Removal"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SettingsPage;
