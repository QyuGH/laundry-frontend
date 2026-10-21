import { NavLink } from "react-router-dom";

/**
 * Mobile floating bottom navigation bar using clean token classes.
 */
function BottomNav({ navItems, unreadCount = 0 }) {
  return (
    <nav className="md:hidden fixed bottom-5 left-4 right-4 z-20">
      <div className="mx-auto w-fit rounded-pill bg-surface/90 backdrop-blur-md border border-border shadow-card flex items-center px-3 py-2 gap-1.5">
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
                  "flex items-center justify-center w-11 h-11 relative rounded-full transition-all duration-150",
                  isActive
                    ? "text-brand bg-brand-soft font-semibold"
                    : "text-text-muted hover:text-text hover:bg-canvas",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {IconComponent && (
                    <IconComponent
                      className="w-5 h-5"
                      weight={isActive ? "bold" : "regular"}
                    />
                  )}
                  {showBadge && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full ring-2 ring-surface" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
