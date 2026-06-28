import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Activity Log", path: "/logs" },
  { label: "Monitoring", path: "/monitoring" },
  { label: "Notifications", path: "/notifications" },
  { label: "Account", path: "/settings" },
];

/**
 * Maps relative paths to display page names for mobile layout headers.
 *
 * @param {string} pathname
 * @returns {string}
 */
const getPageTitle = (pathname) => {
  switch (pathname) {
    case "/":
      return "Home";
    case "/logs":
      return "Activity Log";
    case "/monitoring":
      return "Monitoring";
    case "/notifications":
      return "Notifications";
    case "/settings":
      return "Account Settings";
    default:
      return "Laun-Dry";
  }
};

/**
 * Root layout wrapper for all authenticated pages.
 * Displays mobile header replacement titles dynamically.
 * Restricts UI variables strictly from bg-dark to border-muted.
 *
 * @returns {JSX.Element}
 */
function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuToggle = () => setIsCollapsed((prev) => !prev);
  const currentTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-bg-dark text-text overflow-hidden transition-colors duration-150">
      <Sidebar isCollapsed={isCollapsed} navItems={NAV_ITEMS} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Shared Desktop Header */}
        <Header onMenuToggle={handleMenuToggle} />

        {/* Mobile Page Header */}
        <div className="flex md:hidden items-center justify-between px-5 pt-5 pb-2 bg-bg-dark shrink-0">
          <h2 className="text-lg font-semibold tracking-wide">
            {currentTitle}
          </h2>

          {location.pathname === "/" && (
            <button
              onClick={() => navigate("/monitoring")}
              className="text-xs border border-border px-3 py-1.5 rounded-md text-text-muted hover:text-text transition-colors duration-150 bg-bg"
            >
              Start Session &gt;
            </button>
          )}
        </div>

        <main className="flex-1 overflow-y-auto pb-28 md:pb-0">
          <Outlet />
        </main>

        <BottomNav navItems={NAV_ITEMS} />
      </div>
    </div>
  );
}

export default AppLayout;
