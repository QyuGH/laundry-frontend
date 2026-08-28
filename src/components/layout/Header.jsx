import {
  SidebarToggleIcon,
  SunIcon,
  MoonIcon,
  UserAvatarIcon,
} from "../icons/HeaderIcons";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

/**
 * Application top header bar. Visible on desktop screens only.
 *
 * @param {object} props
 * @param {function} props.onMenuToggle - Callback to toggle the sidebar collapse state.
 * @returns {JSX.Element}
 */
function Header({ onMenuToggle }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="hidden md:flex h-14 border-b border-border items-center justify-between px-4 shrink-0 bg-surface-bg">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex items-center justify-center w-8 h-8 text-text-muted hover:text-text transition-colors duration-150"
          aria-label="Toggle sidebar"
        >
          <SidebarToggleIcon className="w-5 h-5" />
        </button>

        <span className="text-text font-medium text-sm tracking-wide">
          Laun-Dry
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded border border-border hover:bg-bg-light transition-colors duration-150 ml-1 text-text"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <MoonIcon className="w-4 h-4" />
          ) : (
            <SunIcon className="w-4 h-4" />
          )}
        </button>

        <span className="text-text-muted text-xs truncate max-w-[180px]">
          {user?.email ?? ""}
        </span>

        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center shrink-0">
          <UserAvatarIcon className="w-4 h-4 text-text-muted" />
        </div>
      </div>
    </header>
  );
}

export default Header;
