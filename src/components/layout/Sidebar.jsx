import { useState } from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import Modal from "../common/Modal";
import { Waves, SignOut } from "@phosphor-icons/react";

/**
 * Desktop sidebar navigation.
 * Renders brand icon, navigation items, unread badges, and Sign Out button.
 *
 * @param {object} props
 * @param {boolean} props.isCollapsed - Whether sidebar is collapsed.
 * @param {Array<object>} props.navItems - List of navigation items.
 * @param {number} [props.unreadCount=0] - Unread notifications count.
 * @returns {JSX.Element}
 */
function Sidebar({ isCollapsed, navItems, unreadCount = 0 }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
    } catch (err) {
      // Quietly fail
    } finally {
      setIsLoggingOut(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <aside
        className={[
          "hidden md:flex flex-col shrink-0",
          "bg-surface-bg",
          "border-r border-border",
          "transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "w-16" : "w-56",
        ].join(" ")}
      >
        {/* Brand Header */}
        <div
          className={[
            "h-14 flex items-center border-b border-border shrink-0",
            isCollapsed ? "justify-center px-0" : "px-4",
          ].join(" ")}
        >
          <Waves className="w-6 h-6 text-primary shrink-0" weight="bold" />
          {!isCollapsed && (
            <span className="ml-3 text-text font-semibold text-sm tracking-wide whitespace-nowrap">
              Laun-Dry
            </span>
          )}
        </div>

        {/* Nav Items List */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isNotification = item.path === "/notifications";
            const showBadge = isNotification && unreadCount > 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  [
                    "flex items-center rounded-md px-3 py-2 text-sm relative",
                    "transition-colors duration-150",
                    isCollapsed ? "justify-center gap-0" : "gap-3",
                    isActive
                      ? "bg-canvas-bg text-text font-medium"
                      : "text-text-muted hover:text-text hover:bg-canvas-bg/60",
                  ].join(" ")
                }
              >
                <div className="relative flex items-center justify-center">
                  {IconComponent && (
                    <IconComponent className="w-5 h-5 shrink-0" />
                  )}
                  {showBadge && isCollapsed && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-surface-bg" />
                  )}
                </div>

                {!isCollapsed && (
                  <span className="whitespace-nowrap flex-1">{item.label}</span>
                )}

                {!isCollapsed && showBadge && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/30 shrink-0">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Sign Out */}
        <div className="p-2 border-t border-border shrink-0">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className={[
              "flex items-center rounded-md px-3 py-2 text-sm w-full text-text-muted hover:text-danger hover:bg-danger/10 hover:cursor-pointer transition-colors duration-150",
              isCollapsed ? "justify-center gap-0" : "gap-3",
            ].join(" ")}
            aria-label="Sign Out"
          >
            <SignOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => !isLoggingOut && setIsConfirmOpen(false)}
        title="Confirm Sign Out"
      >
        <div className="flex flex-col gap-block">
          <p className="text-text-muted text-xs leading-relaxed">
            Are you sure you want to sign out of Laun-Dry?
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-muted">
            <button
              onClick={() => setIsConfirmOpen(false)}
              disabled={isLoggingOut}
              className="px-3 py-1.5 border border-border-muted rounded-md text-xs font-semibold text-text hover:bg-canvas-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOutConfirm}
              disabled={isLoggingOut}
              className="px-3 py-1.5 border border-danger/30 rounded-md text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Sidebar;
