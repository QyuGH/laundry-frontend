import { useState } from "react";
import { Trash } from "@phosphor-icons/react";
import { addDeviceMember, removeDeviceMember } from "../../services/api";
import Modal from "../common/Modal";
import PasswordInput from "../common/PasswordInput";

const validatePasswordSecurity = (pwd) => pwd.length >= 8 && /\d/.test(pwd);

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

function MembersCard({ members, role, onMemberListChanged }) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberConfirmPassword, setNewMemberConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenAddMemberModal = () => {
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPassword("");
    setNewMemberConfirmPassword("");
    setError(null);
    setIsMemberModalOpen(true);
  };

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
        "Password must be at least 8 characters and contain at least one number.",
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
      setIsMemberModalOpen(false);
      onMemberListChanged("New member registered successfully.");
    } catch (err) {
      setError(err.message || "Failed to add member.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsSaving(true);
    setError(null);
    try {
      await removeDeviceMember(memberToRemove.userId);
      setMemberToRemove(null);
      onMemberListChanged("Member unlinked successfully.");
    } catch (err) {
      setError(err.message || "Failed to remove member.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="card-shell flex flex-col gap-block">
      <div className="section-header pb-block border-b border-border-muted">
        <div>
          <h2 className="text-sm font-medium text-text">Device Members</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {role === "owner"
              ? "Manage members who have access to this device."
              : "View members who share access to this device."}
          </p>
        </div>
        {role === "owner" && (
          <button
            onClick={handleOpenAddMemberModal}
            className="inline-flex items-center gap-inline px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text-muted hover:text-text bg-surface-bg hover:bg-canvas-bg transition-colors duration-150 cursor-pointer shrink-0"
          >
            Add Member
          </button>
        )}
      </div>

      <div className="flex flex-col gap-stack">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between p-3 border border-border-muted rounded-lg bg-canvas-bg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                {getInitials(member.name)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-text">
                  {member.name}
                </span>
                <span className="text-xs text-text-muted">{member.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {member.role === "owner" ? (
                <span className="border border-warning/30 bg-warning/10 text-warning text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Owner
                </span>
              ) : (
                <span className="border border-border-muted bg-surface-bg text-text-muted text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Member
                </span>
              )}

              {role === "owner" && member.role === "member" && (
                <button
                  onClick={() => setMemberToRemove(member)}
                  className="text-text-muted hover:text-danger p-1.5 rounded-md hover:bg-danger/10 transition-colors cursor-pointer"
                  title="Remove Member"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => !isSaving && setIsMemberModalOpen(false)}
        title="Add Device Member"
      >
        <form onSubmit={handleAddMember} className="flex flex-col gap-block">
          <div className="flex flex-col gap-stack">
            <label className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Member Name
            </label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Full Name"
              className="bg-canvas-bg border border-border-muted rounded-md px-3 py-2 text-text text-xs focus:outline-none focus:border-border transition"
              required
            />
          </div>

          <div className="flex flex-col gap-stack">
            <label className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="email@example.com"
              className="bg-canvas-bg border border-border-muted rounded-md px-3 py-2 text-text text-xs focus:outline-none focus:border-border transition"
              required
            />
          </div>

          <PasswordInput
            id="member-password"
            label="Password"
            value={newMemberPassword}
            onChange={(e) => setNewMemberPassword(e.target.value)}
            placeholder="Minimum 8 characters with 1 number"
            required
          />

          <PasswordInput
            id="member-confirm-password"
            label="Confirm Password"
            value={newMemberConfirmPassword}
            onChange={(e) => setNewMemberConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            required
          />

          {error && (
            <p className="text-danger text-xs border border-danger/20 rounded-md p-2.5 bg-danger/10 font-medium">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-block border-t border-border-muted">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text-muted hover:text-text bg-surface-bg hover:bg-canvas-bg transition-colors duration-150 cursor-pointer"
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
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-canvas-bg bg-surface-bg transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? "Registering..." : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!memberToRemove}
        onClose={() => !isSaving && setMemberToRemove(null)}
        title="Remove Member"
      >
        <div className="flex flex-col gap-block">
          <p className="text-text-muted text-xs leading-normal">
            Are you sure you want to remove{" "}
            <span className="text-text font-semibold">
              {memberToRemove?.name}
            </span>
            ? They will lose device access immediately and will no longer
            receive system update notifications.
          </p>

          {error && (
            <p className="text-danger text-xs border border-danger/20 rounded-md p-2.5 bg-danger/10 font-medium">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-block border-t border-border-muted">
            <button
              onClick={() => setMemberToRemove(null)}
              disabled={isSaving}
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text-muted hover:text-text bg-surface-bg hover:bg-canvas-bg transition-colors duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveMember}
              disabled={isSaving}
              className="px-4 py-2 bg-danger/10 border border-danger/30 rounded-md text-xs font-semibold text-danger hover:bg-danger/20 transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? "Removing..." : "Confirm Removal"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default MembersCard;
