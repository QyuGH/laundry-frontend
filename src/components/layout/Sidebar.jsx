import { useState } from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import PlaceholderIcon from "../icons/PlaceholderIcon";
import Modal from "../common/Modal";

/**
 * Desktop sidebar navigation.
 * Renders the top logo, nav items, and a manual Sign Out button at the bottom.
 * Opens a confirmation modal before triggering the logout request.
 *
 * @param {object} props
 * @param {boolean} props.isCollapsed - Whether the sidebar is in icon-only mode.
 * @param {Array<{label: string, path: string}>} props.navItems - Navigation item list.
 * @returns {JSX.Element}
 */
function Sidebar({ isCollapsed, navItems }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
    } catch (err) {
      // Quietly fail and allow cleanup
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
        {/* Logo area */}
        <div
          className={[
            "h-14 flex items-center border-b border-border-muted shrink-0",
            isCollapsed ? "justify-center px-0" : "px-4",
          ].join(" ")}
        >
          <PlaceholderIcon className="w-6 h-6 text-text shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 text-text font-semibold text-sm tracking-wide whitespace-nowrap">
              Laun-Dry
            </span>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center rounded-md px-3 py-2 text-sm",
                  "transition-colors duration-150",
                  isCollapsed ? "justify-center gap-0" : "gap-3",
                  isActive
                    ? "bg-highlight text-text"
                    : "text-text-muted hover:text-text hover:bg-bg-light",
                ].join(" ")
              }
            >
              <PlaceholderIcon className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out Button */}
        <div className="p-2 border-t border-border-muted shrink-0">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className={[
              "flex items-center rounded-md px-3 py-2 text-sm w-full text-text-muted hover:text-text hover:bg-bg-light transition-colors duration-150",
              isCollapsed ? "justify-center gap-0" : "gap-3",
            ].join(" ")}
            aria-label="Sign Out"
          >
            <PlaceholderIcon className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal Overlay */}
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
