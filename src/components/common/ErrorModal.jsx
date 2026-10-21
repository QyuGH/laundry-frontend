import Modal from "./Modal";
import { WarningCircle } from "@phosphor-icons/react";

/**
 * Reusable error alert modal for system and API failure handling.
 */
function ErrorModal({
  isOpen,
  onClose,
  title = "Something went wrong",
  message,
  onRetry,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null}>
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-12 h-12 rounded-full bg-danger-soft text-danger border border-danger-border flex items-center justify-center shrink-0">
          <WarningCircle className="w-6 h-6" weight="bold" />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold font-display text-text">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {message ||
              "An unexpected error occurred while communicating with the system. Please try again."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 w-full pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-md border border-border text-xs font-semibold text-text hover:bg-canvas transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          {onRetry && (
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="flex-1 px-4 py-2.5 rounded-md bg-brand hover:bg-brand-600 text-white text-xs font-semibold shadow-interactive transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ErrorModal;
