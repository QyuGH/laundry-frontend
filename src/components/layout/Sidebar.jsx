import { useState } from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import Modal from "../common/Modal";

import { HomeIcon, SignoutIcon } from "../icons/NavIcons";

/**
 * Desktop sidebar navigation.
 * Renders logo, navigation items, unread badges, and Sign Out button.
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
          "border-r border-border-muted",
          "transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "w-16" : "w-56",
        ].join(" ")}
      >
        <div
          className={[
            "h-14 flex items-center border-b border-border-muted shrink-0",
            isCollapsed ? "justify-center px-0" : "px-4",
          ].join(" ")}
        >
          <HomeIcon className="w-6 h-6 text-text shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 text-text font-semibold text-sm tracking-wide whitespace-nowrap">
              Laun-Dry
            </span>
          )}
        </div>

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
                      ? "bg-highlight text-text"
                      : "text-text-muted hover:text-text hover:bg-bg-light",
                  ].join(" ")
                }
              >
                <div className="relative flex items-center justify-center">
                  {IconComponent && (
                    <IconComponent className="w-5 h-5 shrink-0" />
                  )}
                  {showBadge && isCollapsed && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-dark" />
                  )}
                </div>

                {!isCollapsed && (
                  <span className="whitespace-nowrap flex-1">{item.label}</span>
                )}

                {!isCollapsed && showBadge && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border-muted shrink-0">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className={[
              "flex items-center rounded-md px-3 py-2 text-sm w-full text-text-muted hover:text-text hover:bg-bg-light transition-colors duration-150",
              isCollapsed ? "justify-center gap-0" : "gap-3",
            ].join(" ")}
            aria-label="Sign Out"
          >
            <SignoutIcon className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => !isLoggingOut && setIsConfirmOpen(false)}
        title="Sign Out"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-muted text-sm">
            Are you sure you want to sign out of your Laun-Dry session? You will
            need to enter your email and password to log in again.
          </p>

          <div className="flex justify-end gap-2.5 mt-2">
            <button
              onClick={() => setIsConfirmOpen(false)}
              disabled={isLoggingOut}
              className="px-4 py-2 border border-border-muted rounded-md text-xs font-medium text-text hover:bg-bg-light transition-colors duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOutConfirm}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-bg-light border border-border rounded-md text-xs font-medium text-text hover:bg-highlight transition-colors duration-150 disabled:opacity-50"
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
