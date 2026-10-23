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
import { User, EnvelopeSimple, Key, PencilSimple } from "@phosphor-icons/react";

const validatePasswordSecurity = (pwd) => pwd.length >= 8 && /\d/.test(pwd);

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
      onSuccess("Display name updated.");
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
        "Password must be at least 8 characters and include at least one number.",
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
      onSuccess("Password updated successfully.");
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
    <section className="rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
            Account
          </span>
          <h3 className="text-lg font-bold font-display text-text mt-0.5">
            Personal Profile
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Your account information and sign in security.
          </p>
        </div>

        <button
          onClick={handleOpenProfileModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:text-brand hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <PencilSimple className="w-4 h-4" weight="bold" />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <User className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Display Name
              </span>
              <span className="text-sm sm:text-base font-bold font-display text-text mt-0.5 truncate">
                {profileName || "User"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <EnvelopeSimple className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Email Address
              </span>
              <span className="text-sm sm:text-base font-medium text-text mt-0.5 truncate">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <Key className="w-5 h-5" weight="bold" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-display">
                Account Password
              </span>
              <span className="text-sm font-medium text-text-muted mt-0.5">
                Secured with password encryption
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenPasswordModal}
            className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:text-brand hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Change Password
          </button>
        </div>
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => !isSaving && setIsProfileModalOpen(false)}
        title="Update Display Name"
      >
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-brand font-display mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={editNameInput}
              onChange={(e) => setEditNameInput(e.target.value)}
              className="w-full bg-canvas border border-border rounded-md px-3.5 py-2.5 text-text text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              required
            />
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Email address is linked to your authentication account and cannot be
            modified here.
          </p>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer"
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
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold bg-brand text-white hover:bg-brand-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <PasswordInput
            id="cur-password"
            label="Current Password"
            value={curPassword}
            onChange={(e) => setCurPassword(e.target.value)}
            required
          />

          <div className="flex flex-col gap-4 pt-3 border-t border-border">
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

          <p className="text-xs text-text-muted leading-relaxed">
            Password must have at least 8 characters with at least one number.
          </p>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer"
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
                !validatePasswordSecurity(newPassword) ||
                newPassword !== confirmPassword
              }
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold bg-brand text-white hover:bg-brand-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default ProfileCard;
