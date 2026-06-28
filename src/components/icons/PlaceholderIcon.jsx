/**
 * Temporary placeholder icon component.
 * Renders an empty rounded rectangle SVG.
 * Replace with final SVG asset before production.
 *
 * @param {object} props
 * @param {string} [props.className] - Tailwind classes for sizing and color.
 * @returns {JSX.Element}
 */
function PlaceholderIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default PlaceholderIcon;
