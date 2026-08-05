import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { updateProfile } from "../../services/api";
import Modal from "../common/Modal";
import PasswordInput from "../common/PasswordInput";

const validatePasswordSecurity = (pwd) => pwd.length >= 8 && /\d/.test(pwd);

/**
 * Personal profile card.
 * Displays name, email, and password rows.
 * Owns the Edit Profile and Change Password modals.
 *
 * @param {object} props
 * @param {object} props.user - Firebase user object.
 * @param {string} props.profileName - Current display name.
 * @param {function} props.onProfileNameChange - Setter for display name after save.
 * @param {function} props.onSuccess - Callback to trigger parent success toast.
 * @returns {JSX.Element}
 */
function ProfileCard({ user, profileName, onProfileNameChange, onSuccess }) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editNameInput, setEditNameInput] = useState("");
  const [curPassword, setCurPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenProfileModal = () => {
    setEditNameInput(profileName);
    setError(null);
    setIsProfileModalOpen(true);
  };

  const handleOpenPasswordModal = () => {
    setCurPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setIsPasswordModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editNameInput.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile(editNameInput.trim());
      onProfileNameChange(editNameInput.trim());
      setIsProfileModalOpen(false);
      onSuccess("Profile display name updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile name.");
    } finally {
      setIsSaving(false);
    }
  };

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
      onSuccess("Account password updated successfully.");
    } catch (err) {
      setError(
        err.message ||
          "Failed to change password. Please verify current credentials.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="card-shell flex flex-col">
      <div className="section-header pb-block border-b border-border-muted">
        <div>
          <h2 className="text-base font-semibold text-text">
            Personal Profile
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Manage your personal settings details.
          </p>
        </div>
        <button
          onClick={handleOpenProfileModal}
          className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg shrink-0"
        >
          Edit Profile
        </button>
      </div>

      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-block py-block">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text">Name</span>
            <span className="text-xs text-text-muted">
              Used across notifications.
            </span>
          </div>
          <span className="text-xs font-medium text-text text-right">
            {profileName}
          </span>
        </div>

        <div className="flex items-start justify-between gap-block py-block border-t border-border-muted/30">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text">Email Address</span>
            <span className="text-xs text-text-muted">
              Primary login credential.
            </span>
          </div>
          <span className="text-xs text-text-muted text-right">
            {user?.email}
          </span>
        </div>

        <div className="flex items-start justify-between gap-block py-block border-t border-border-muted/30">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text">Password</span>
            <span className="text-xs text-text-muted">
              Manage your account credentials.
            </span>
          </div>
          <button
            onClick={handleOpenPasswordModal}
            className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg shrink-0"
          >
            Change Password
          </button>
        </div>
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => !isSaving && setIsProfileModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-block">
          <div className="flex flex-col gap-stack">
            <label className="text-micro uppercase tracking-wider text-text-muted">
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

          <p className="text-micro text-text-muted italic">
            Email address cannot be changed from this profile editor.
          </p>

          {error && (
            <p className="text-red-400 text-xs border border-red-400/20 rounded p-2.5 bg-red-400/10 font-medium">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-block border-t border-border-muted/30">
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
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => !isSaving && setIsPasswordModalOpen(false)}
        title="Change Password"
      >
        <form
          onSubmit={handleChangePassword}
          className="flex flex-col gap-block"
        >
          <PasswordInput
            id="cur-password"
            label="Current Password"
            value={curPassword}
            onChange={(e) => setCurPassword(e.target.value)}
            required
          />

          <div className="flex flex-col gap-block pt-block border-t border-border-muted/30">
            <PasswordInput
              id="new-password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs border border-red-400/20 rounded p-2.5 bg-red-400/10 font-medium">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-block border-t border-border-muted/30">
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
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition disabled:opacity-50"
            >
              {isSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default ProfileCard;
