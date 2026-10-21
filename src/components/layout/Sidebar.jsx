import { useState } from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import Modal from "../common/Modal";
import { Waves, SignOut } from "@phosphor-icons/react";

/**
 * Desktop sidebar navigation following the reference design.
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
          "bg-surface",
          "border-r border-border",
          "transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "w-20" : "w-60",
        ].join(" ")}
      >
        {/* Brand Header */}
        <div
          className={[
            "h-16 flex items-center border-b border-border shrink-0",
            isCollapsed ? "justify-center px-0" : "px-5",
          ].join(" ")}
        >
          <Waves className="w-6 h-6 text-brand shrink-0" weight="bold" />
          {!isCollapsed && (
            <span className="ml-3 text-text font-display font-bold text-base tracking-tight whitespace-nowrap">
              Laun-Dry
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 flex flex-col gap-1.5 px-3">
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
                    "group relative flex items-center rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                    isCollapsed ? "justify-center gap-0" : "gap-3",
                    isActive
                      ? "bg-brand-soft text-brand font-semibold shadow-xs"
                      : "text-text-muted hover:text-text hover:bg-canvas",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active vertical accent pill on the left */}
                    {isActive && (
                      <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 bg-brand rounded-r-full" />
                    )}

                    <div className="relative flex items-center justify-center shrink-0">
                      {IconComponent && (
                        <IconComponent
                          className="w-5 h-5 transition-transform group-hover:scale-105"
                          weight={isActive ? "bold" : "regular"}
                        />
                      )}
                      {showBadge && isCollapsed && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand rounded-full ring-2 ring-surface" />
                      )}
                    </div>

                    {!isCollapsed && (
                      <span className="whitespace-nowrap flex-1">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && showBadge && (
                      <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer: Sign Out Button */}
        <div className="p-3 border-t border-border shrink-0">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className={[
              "flex items-center rounded-lg px-3.5 py-2.5 text-sm font-medium w-full text-danger hover:bg-danger-soft transition-colors cursor-pointer",
              isCollapsed ? "justify-center gap-0" : "gap-3",
            ].join(" ")}
            aria-label="Sign Out"
          >
            <SignOut className="w-5 h-5 shrink-0" weight="bold" />
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

export default Sidebar;
