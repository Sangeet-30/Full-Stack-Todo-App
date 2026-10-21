import { useContext } from "react";
import { FiAlertCircle, FiCheckCircle, FiRefreshCw, FiX } from "react-icons/fi";
import { TodoContext } from "../store/TodoContext";

function NotificationBanner() {
  const { error, successMessage, clearError, refreshItems, isLoading } =
    useContext(TodoContext);

  if (!error && !successMessage) return null;

  return (
    <div className="mb-6 space-y-3">
      {error && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-rose-800 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <FiAlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={refreshItems}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200 disabled:opacity-50 transition"
            >
              <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
              Retry
            </button>
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="rounded-lg p-1 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-emerald-800 shadow-xs animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <FiCheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBanner;

