import { useEffect } from "react";

/**
 * Token-aligned reusable modal dialog with backdrop blur.
 */
function Modal({ isOpen, onClose, title, children }) {
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
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-surface border border-border rounded-lg max-w-sm w-full p-6 shadow-elevated z-10 flex flex-col gap-4">
        {title && (
          <h3 className="text-text font-display text-base font-bold tracking-tight border-b border-border pb-3">
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
