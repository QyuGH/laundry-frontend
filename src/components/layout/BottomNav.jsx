import { NavLink } from "react-router-dom";

/**
 * Mobile floating bottom navigation bar.
 * Renders icon navigation links with red unread dot overlay for notifications.
 *
 * @param {object} props
 * @param {Array<object>} props.navItems - Navigation item list.
 * @param {number} [props.unreadCount=0] - Unread notification count.
 * @returns {JSX.Element}
 */
function BottomNav({ navItems, unreadCount = 0 }) {
  return (
    <nav className="md:hidden fixed bottom-5 left-5 right-5 z-50">
      <div className="mx-auto w-fit rounded-full backdrop-blur-xl bg-background/70 dark:bg-background/60 border border-white/20 shadow-lg shadow-black/10 flex items-center px-3 py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isNotification = item.path === "/notifications";
          const showBadge = isNotification && unreadCount > 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              aria-label={item.label}
              className={({ isActive }) =>
                [
                  "flex items-center justify-center w-11 h-11 relative",
                  "transition-colors duration-150",
                  isActive ? "text-text" : "text-text-muted hover:text-text",
                ].join(" ")
              }
            >
              {IconComponent && <IconComponent className="w-6 h-6" />}
              {showBadge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full ring-2 ring-canvas-bg" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
