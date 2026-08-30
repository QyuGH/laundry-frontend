import { useState } from "react";
import { useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useTheme } from "../../context/ThemeContext";
import Modal from "../common/Modal";
import { SunIcon, MoonIcon } from "../icons/HeaderIcons";
import { SignOut, ListIcon } from "@phosphor-icons/react";

/**
 * Route-to-title mapping for dynamic header display.
 */
const PAGE_TITLES = {
  "/": "Dashboard",
  "/monitoring": "Live Telemetry",
  "/logs": "Activity History",
  "/notifications": "Notifications",
  "/settings": "Account Settings",
};

/**
 * Global Top Header Bar.
 * Visible on both mobile and desktop screens.
 * Displays dynamic active page title, sidebar toggle (desktop), theme switcher,
 * and a streamlined sign out button with confirmation modal.
 *
 * @param {object} props
 * @param {function} props.onMenuToggle - Callback to toggle desktop sidebar collapse state.
 * @returns {JSX.Element}
 */
function Header({ onMenuToggle }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";

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
      <header className="flex h-14 border-b border-border items-center justify-between px-4 shrink-0 bg-surface-bg transition-colors duration-150">
        {/* Left Section: Sidebar Toggle (desktop only) + Dynamic Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="hidden md:flex items-center justify-center w-8 h-8 text-text-muted hover:text-text hover:cursor-pointer transition-colors duration-150 shrink-0"
            aria-label="Toggle sidebar"
          >
            <ListIcon className="w-5 h-5" />
          </button>

          <h1 className="text-text font-semibold text-base tracking-wide truncate">
            {pageTitle}
          </h1>
        </div>

        {/* Right Section: Theme Toggle & Sign Out (Mobile) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-border text-text hover:bg-canvas-bg hover:cursor-pointer transition-colors duration-150"
            aria-label="Toggle theme"
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <MoonIcon className="w-4 h-4" />
            ) : (
              <SunIcon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsConfirmOpen(true)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md border border-border text-text-muted hover:text-danger hover:border-danger/40 hover:bg-danger/10 transition-colors duration-150"
            aria-label="Sign out"
            title="Sign out"
          >
            <SignOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
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

export default Header;
