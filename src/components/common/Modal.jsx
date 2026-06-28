import { useEffect } from "react";

/**
 * Reusable modal overlay component.
 * Renders a centered dialog box on top of a dark, semi-transparent backdrop.
 * Restricts UI variables strictly from bg-dark to border-muted.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback triggered when the backdrop is clicked or modal is closed.
 * @param {string} props.title - Heading text at the top of the modal.
 * @param {React.ReactNode} props.children - Modal content and actions.
 * @returns {JSX.Element|null}
 */
function Modal({ isOpen, onClose, title, children }) {
  // Prevent background scrolling while the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-bg-dark/80 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-bg border border-border rounded-lg max-w-sm w-full p-6 shadow-lg z-10 flex flex-col gap-4">
        {title && (
          <h3 className="text-text text-base font-semibold tracking-wide border-b border-border-muted pb-2">
            {title}
          </h3>
        )}

        <div className="text-text-muted text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
