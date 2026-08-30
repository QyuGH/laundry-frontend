/**
 * Dedicated custom icons for Laun-Dry mechanical components.
 * General metrics use standard @phosphor-icons/react components.
 */

export function PulleyStatusIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function MotorIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Driver Pulley */}
      <circle cx="6" cy="12" r="3" />
      <circle cx="6" cy="12" r="1" />

      {/* Driven Pulley */}
      <circle cx="18" cy="12" r="5" />
      <circle cx="18" cy="12" r="1.5" />

      {/* Belt */}
      <line x1="6" y1="9" x2="18" y2="7" />
      <line x1="6" y1="15" x2="18" y2="17" />
    </svg>
  );
}
