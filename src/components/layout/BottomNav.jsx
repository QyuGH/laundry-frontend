import { NavLink } from "react-router-dom";
import PlaceholderIcon from "../icons/PlaceholderIcon";

/**
 * Mobile floating bottom navigation bar.
 * Visible only on screens below the md breakpoint.
 * Pill-shaped, floating above the bottom edge with horizontal margins.
 * Displays icon-only navigation items.
 *
 * @param {object} props
 * @param {Array<{label: string, path: string}>} props.navItems - Navigation item list.
 * @returns {JSX.Element}
 */
function BottomNav({ navItems }) {
  return (
    <nav className="md:hidden fixed bottom-5 left-5 right-5 z-50">
      <div className="bg-black border border-white/20 rounded-full px-6 py-3 flex items-center justify-around">
        {navItems.map((item) => {
          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              aria-label={item.label}
              className={({ isActive }) =>
                [
                  "flex items-center justify-center w-9 h-9",
                  "transition-colors duration-150",
                  isActive ? "text-white" : "text-white/30 hover:text-white/60",
                ].join(" ")
              }
            >
              {IconComponent && <IconComponent className="w-5 h-5" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
