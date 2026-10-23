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
        <div className="flex items-center justify-center py-12">
          <span className="text-xs font-medium text-text-muted tracking-wide">
            Loading account details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="section-stack">
      <div className="flex flex-col max-w-2xl">
        <span className="text-xs font-bold tracking-widest text-brand uppercase font-display mb-1.5">
          Your Household Setup
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-text tracking-tight leading-tight">
          Profile and device
        </h2>
        <p className="text-sm text-text-muted mt-2">
          Keep your personal details and connected clothesline up to date.
        </p>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-success/30 bg-success-soft p-4 text-xs font-semibold text-success">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-xs font-semibold text-danger">
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
