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
      {/* Paste the inner SVG elements here */}
      {/* Replace any hardcoded fill="#000" or stroke="#000" with currentColor */}
    </svg>
  );
}

export default HomeIcon;
