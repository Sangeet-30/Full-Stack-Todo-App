import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <FiAlertTriangle className="text-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id="confirm-modal-title"
              className="text-base font-semibold text-slate-900"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-xs focus:outline-none focus:ring-2 transition ${
              confirmVariant === "danger"
                ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-400"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

