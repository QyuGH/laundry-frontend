import PlaceholderIcon from "../icons/PlaceholderIcon";
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
    <header className="hidden md:flex h-14 border-b border-border-muted items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex items-center justify-center w-8 h-8 text-text-muted hover:text-text transition-colors duration-150"
          aria-label="Toggle sidebar"
        >
          <PlaceholderIcon className="w-5 h-5" />
        </button>

        <span className="text-text font-medium text-sm tracking-wide">
          Laun-Dry
        </span>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded border border-border hover:bg-bg-light transition-colors duration-150 ml-1 text-text"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-text-muted text-xs truncate max-w-[180px]">
          {user?.email ?? ""}
        </span>

        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center shrink-0">
          <PlaceholderIcon className="w-4 h-4 text-text-muted" />
        </div>
      </div>
    </header>
  );
}

export default Header;
