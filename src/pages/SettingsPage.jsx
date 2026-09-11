import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getDevice, getDeviceMembers } from "../services/api";
import ProfileCard from "../components/settings/ProfileCard";
import DeviceCard from "../components/settings/DeviceCard";
import MembersCard from "../components/settings/MembersCard";

let settingsCache = {
  data: null,
  userId: null,
};

export const clearSettingsCache = () => {
  settingsCache = {
    data: null,
    userId: null,
  };
};

function SettingsPage() {
  const { user } = useAuth();
  const cached =
    user?.uid && settingsCache.userId === user.uid ? settingsCache.data : null;

  const [profileName, setProfileName] = useState(user?.displayName || "");
  const [device, setDevice] = useState(cached?.device || null);
  const [members, setMembers] = useState(cached?.members || []);
  const [role, setRole] = useState(cached?.role || "member");
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchSettingsData = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const devRes = await getDevice();
        let newDevice = null;
        let newRole = "member";
        if (devRes && devRes.device) {
          newDevice = devRes.device;
          newRole = devRes.device.ownerId === user?.uid ? "owner" : "member";
          setDevice(newDevice);
          setRole(newRole);
        }

        const memRes = await getDeviceMembers();
        let newMembers = [];
        if (memRes && memRes.members) {
          newMembers = memRes.members;
          setMembers(newMembers);
        }

        settingsCache = {
          userId: user?.uid,
          data: {
            device: newDevice,
            members: newMembers,
            role: newRole,
          },
        };
      } catch (err) {
        setError(err.message || "Failed to load account settings.");
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (!cached) {
      fetchSettingsData(true);
    }
  }, [cached, fetchSettingsData]);

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
        onProfileNameChange={(newName) => {
          setProfileName(newName);
          if (settingsCache.data) {
            settingsCache.data.members = settingsCache.data.members.map((m) =>
              m.userId === user?.uid ? { ...m, name: newName } : m,
            );
            setMembers(settingsCache.data.members);
          }
        }}
        onSuccess={triggerSuccessToast}
      />

      <DeviceCard
        device={device}
        role={role}
        onDeviceSaved={async (msg) => {
          await fetchSettingsData(false);
          triggerSuccessToast(msg);
        }}
      />

      <MembersCard
        members={members}
        role={role}
        onMemberListChanged={async (msg) => {
          await fetchSettingsData(false);
          triggerSuccessToast(msg);
        }}
      />
    </div>
  );
}

export default SettingsPage;
