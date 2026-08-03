import { useState } from "react";
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

/**
 * Device members card.
 * Displays member list with role badges.
 * Owner can add and remove members.
 * Owns Add Member and Remove Member modals.
 *
 * @param {object} props
 * @param {Array} props.members - List of member objects.
 * @param {string} props.role - Current user role: "owner" or "member".
 * @param {function} props.onMemberListChanged - Callback after add/remove.
 * @returns {JSX.Element}
 */
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
    <section className="card-shell flex flex-col gap-[var(--gap-block)]">
      <div className="section-header pb-[var(--gap-block)] border-b border-border-muted">
        <div>
          <h2 className="text-sm font-semibold text-text">Device Members</h2>
          <p className="text-[var(--text-micro)] text-text-muted mt-0.5">
            {role === "owner"
              ? "Manage members who have access to this device."
              : "View members who share access to this device."}
          </p>
        </div>
        {role === "owner" && (
          <button
            onClick={handleOpenAddMemberModal}
            className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition bg-bg shrink-0"
          >
            Add Member
          </button>
        )}
      </div>

      <div className="flex flex-col gap-[var(--gap-stack)]">
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
                <span className="text-[var(--text-micro)] text-text-muted">
                  {member.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {member.role === "owner" ? (
                <span className="border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 text-[var(--text-micro)] px-2.5 py-0.5 rounded-full font-medium">
                  Owner
                </span>
              ) : (
                <span className="border border-border-muted bg-white/5 text-text-muted text-[var(--text-micro)] px-2.5 py-0.5 rounded-full font-medium">
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

      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => !isSaving && setIsMemberModalOpen(false)}
        title="Add Device Member"
      >
        <form
          onSubmit={handleAddMember}
          className="flex flex-col gap-[var(--gap-block)]"
        >
          <div className="flex flex-col gap-[var(--gap-stack)]">
            <label className="text-[var(--text-micro)] uppercase tracking-wider text-text-muted">
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

          <div className="flex flex-col gap-[var(--gap-stack)]">
            <label className="text-[var(--text-micro)] uppercase tracking-wider text-text-muted">
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
            <p className="text-red-400 text-xs border border-red-400/20 rounded p-2.5 bg-red-400/10 font-medium">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-[var(--gap-block)] border-t border-border-muted/30">
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
              className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-text hover:bg-bg-light transition disabled:opacity-50"
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
        <div className="flex flex-col gap-[var(--gap-block)]">
          <p className="text-text-muted text-xs leading-normal">
            Are you sure you want to remove{" "}
            <span className="text-text font-semibold">
              {memberToRemove?.name}
            </span>
            ? They will lose device access immediately and will no longer
            receive system update notifications.
          </p>

          {error && (
            <p className="text-red-400 text-xs border border-red-400/20 rounded p-2.5 bg-red-400/10 font-medium">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-[var(--gap-block)] border-t border-border-muted/30">
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
    </section>
  );
}

export default MembersCard;
