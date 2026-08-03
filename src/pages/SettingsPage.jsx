import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getDevice, getDeviceMembers } from "../services/api";
import ProfileCard from "../components/settings/ProfileCard";
import DeviceCard from "../components/settings/DeviceCard";
import MembersCard from "../components/settings/MembersCard";

/**
 * Account Settings page.
 * Orchestrates settings data fetch and success toast state.
 * Delegates all display and modal logic to ProfileCard, DeviceCard, and MembersCard.
 *
 * @returns {JSX.Element}
 */
function SettingsPage() {
  const { user } = useAuth();

  const [profileName, setProfileName] = useState(user?.displayName || "");
  const [device, setDevice] = useState(null);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchSettingsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const devRes = await getDevice();
      if (devRes && devRes.device) {
        setDevice(devRes.device);
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

  const triggerSuccessToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  if (isLoading) {
    return (
      <div className="section-stack">
        <p className="text-text-muted text-xs italic">
          Loading profile settings...
        </p>
      </div>
    );
  }

  return (
    <div className="section-stack">
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

      <ProfileCard
        user={user}
        profileName={profileName}
        onProfileNameChange={setProfileName}
        onSuccess={triggerSuccessToast}
      />

      <DeviceCard
        device={device}
        role={role}
        onDeviceSaved={async (msg) => {
          await fetchSettingsData();
          triggerSuccessToast(msg);
        }}
      />

      <MembersCard
        members={members}
        role={role}
        onMemberListChanged={async (msg) => {
          await fetchSettingsData();
          triggerSuccessToast(msg);
        }}
      />
    </div>
  );
}

export default SettingsPage;
