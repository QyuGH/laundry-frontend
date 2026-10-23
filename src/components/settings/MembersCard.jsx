import { useState } from "react";
import { Trash, UserPlus } from "@phosphor-icons/react";
import { addDeviceMember, removeDeviceMember } from "../../services/api";
import Modal from "../common/Modal";
import PasswordInput from "../common/PasswordInput";

const validatePasswordSecurity = (pwd) => pwd.length >= 8 && /\d/.test(pwd);

const getInitials = (name) => {
  if (!name) return "U";
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
        "Password must be at least 8 characters and include at least one number.",
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
      onMemberListChanged("Household member added.");
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
      onMemberListChanged("Member access removed.");
    } catch (err) {
      setError(err.message || "Failed to remove member.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-card flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wider text-brand uppercase font-display">
            Household Access
          </span>
          <h3 className="text-lg font-bold font-display text-text mt-0.5">
            Shared Members
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Family and household members who can operate this clothesline.
          </p>
        </div>

        {role === "owner" && (
          <button
            onClick={handleOpenAddMemberModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-brand text-white hover:bg-brand-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" weight="bold" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      <div className="flex flex-col divide-y divide-border">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between py-3.5 gap-4"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-md bg-brand-soft text-brand font-bold font-display text-xs flex items-center justify-center shrink-0">
                {getInitials(member.name)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base font-bold font-display text-text truncate">
                  {member.name}
                </span>
                <span className="text-xs text-text-muted mt-0.5 truncate">
                  {member.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-[10px] font-bold font-display uppercase tracking-wider ${
                  member.role === "owner"
                    ? "bg-brand-soft text-brand"
                    : "bg-canvas border border-border text-text-muted"
                }`}
              >
                {member.role === "owner" ? "Owner" : "Member"}
              </span>

              {role === "owner" && member.role !== "owner" && (
                <button
                  onClick={() => setMemberToRemove(member)}
                  className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                  title="Remove member access"
                  aria-label="Remove member access"
                >
                  <Trash className="w-4 h-4" weight="bold" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => !isSaving && setIsMemberModalOpen(false)}
        title="Add Household Member"
      >
        <form onSubmit={handleAddMember} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-brand font-display mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="w-full bg-canvas border border-border rounded-md px-3.5 py-2.5 text-text text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-brand font-display mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="w-full bg-canvas border border-border rounded-md px-3.5 py-2.5 text-text text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-4 pt-2 border-t border-border">
            <PasswordInput
              id="new-member-password"
              label="Password"
              value={newMemberPassword}
              onChange={(e) => setNewMemberPassword(e.target.value)}
              required
            />
            <PasswordInput
              id="confirm-member-password"
              label="Confirm Password"
              value={newMemberConfirmPassword}
              onChange={(e) => setNewMemberConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-2">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold bg-brand text-white hover:bg-brand-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!memberToRemove}
        onClose={() => !isSaving && setMemberToRemove(null)}
        title="Remove Member Access"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted leading-relaxed">
            Are you sure you want to remove access for{" "}
            <span className="font-bold text-text">{memberToRemove?.name}</span>?
            They will immediately lose access to operate or monitor this
            clothesline.
          </p>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-2">
            <button
              type="button"
              onClick={() => setMemberToRemove(null)}
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold border border-border text-text bg-surface hover:bg-canvas hover:border-border-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRemoveMember}
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold bg-danger text-white hover:bg-danger-strong hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? "Removing..." : "Remove Member"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default MembersCard;
