/**
 * Home icon.
 * Source: src/assets/icons/home.svg
 *
 * @param {object} props
 * @param {string} [props.className] - Tailwind classes for sizing and color.
 * @returns {JSX.Element}
 */
function HomeIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24" // ← paste your SVG's viewBox value here
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 13.24V21h18v-7.76M12 15.57l7.25-4.35V11H4.75v0.22L12 15.57zM12 15.57l-7.25-4.35V11H4.75v0.22L12 15.57z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default HomeIcon;
