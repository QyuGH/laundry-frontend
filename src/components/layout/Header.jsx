import { useState } from "react";
import { useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useTheme } from "../../context/ThemeContext";
import Modal from "../common/Modal";
import { List, Sun, Moon, SignOut } from "@phosphor-icons/react";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/monitoring": "Live Telemetry",
  "/logs": "Activity History",
  "/notifications": "Notifications",
  "/settings": "Account Settings",
};

/**
 * Global Top Header Bar with new token styling and capsule theme switcher.
 */
function Header({ onMenuToggle }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";
  const isDark = theme === "dark";

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
      <header className="flex h-16 border-b border-border items-center justify-between px-4 sm:px-6 shrink-0 bg-surface transition-colors duration-150">
        {/* Left Section: Sidebar Toggle + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-text-muted hover:text-text hover:bg-canvas transition-colors shrink-0 cursor-pointer hidden md:flex "
            aria-label="Toggle sidebar"
          >
            <List className="w-5 h-5" weight="bold" />
          </button>

          <h1 className="text-text font-display font-semibold text-base sm:text-lg tracking-tight truncate">
            {pageTitle}
          </h1>
        </div>

        {/* Right Section: Theme Switcher Capsule & Mobile Signout */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="relative flex items-center p-1 rounded-pill border border-border bg-canvas hover:border-border-strong transition-all cursor-pointer"
            aria-label="Toggle theme"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
                !isDark
                  ? "bg-brand text-white shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Sun className="w-4 h-4" weight={!isDark ? "fill" : "regular"} />
            </div>

            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
                isDark
                  ? "bg-brand text-white shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Moon className="w-4 h-4" weight={isDark ? "fill" : "regular"} />
            </div>
          </button>

          <button
            onClick={() => setIsConfirmOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md border border-border text-text-muted hover:text-danger hover:border-danger hover:bg-danger-soft transition-colors cursor-pointer"
            aria-label="Sign out"
            title="Sign out"
          >
            <SignOut className="w-4 h-4" weight="bold" />
          </button>
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => !isLoggingOut && setIsConfirmOpen(false)}
        title="Confirm Sign Out"
      >
        <div className="flex flex-col gap-4">
          <p className="text-text-muted text-sm leading-relaxed">
            Are you sure you want to sign out of Laun-Dry?
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              onClick={() => setIsConfirmOpen(false)}
              disabled={isLoggingOut}
              className="px-4 py-2 border border-border rounded-md text-sm font-medium text-text hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOutConfirm}
              disabled={isLoggingOut}
              className="px-4 py-2 border border-danger rounded-md text-sm font-medium text-white bg-danger hover:bg-danger-600 transition-colors cursor-pointer disabled:opacity-50"
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
