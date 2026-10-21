import { useContext, useState } from "react";
import {
  FiCalendar,
  FiCheck,
  FiEdit2,
  FiSave,
  FiTrash2,
  FiX,
  FiClock,
} from "react-icons/fi";
import { TodoContext } from "../store/TodoContext";
import ConfirmModal from "./ConfirmModal";
import {
  getTodayDateString,
  extractCalendarDate,
  isDateTodayOrFuture,
  getDueDateStatus,
  canEditTask,
} from "../utils/dateUtils";

const TodoItem = ({ todoName, todoDate, todoId, completed }) => {
  const { deleteItem, toggleItem, editItem, isMutating } =
    useContext(TodoContext);

  const normalizedDate = extractCalendarDate(todoDate);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(todoName);
  const [editDate, setEditDate] = useState(normalizedDate);
  const [editError, setEditError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Completed tasks are strictly non-editable
  const isCurrentlyEditing = isEditing && canEditTask(completed);

  const handleStartEdit = () => {
    if (!canEditTask(completed)) return;
    setEditName(todoName);
    setEditDate(normalizedDate);
    setEditError("");
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!canEditTask(completed)) {
      setIsEditing(false);
      return;
    }

    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError("Task description cannot be empty.");
      return;
    }
    if (trimmed.length > 300) {
      setEditError("Task description cannot exceed 300 characters.");
      return;
    }

    const cleanDate = extractCalendarDate(editDate);
    if (!cleanDate) {
      setEditError("Please select a due date.");
      return;
    }

    if (!isDateTodayOrFuture(cleanDate)) {
      setEditError("Due date cannot be earlier than today.");
      return;
    }

    setEditError("");
    const success = await editItem(todoId, trimmed, cleanDate);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(todoName);
    setEditDate(normalizedDate);
    setEditError("");
    setIsEditing(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false);
    await deleteItem(todoId);
  };

  const dateBadge = getDueDateStatus(normalizedDate, completed);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <>
      <article
        className={`group rounded-xl border p-3.5 sm:p-4 transition-all duration-150 ${
          completed
            ? "border-emerald-200/70 bg-emerald-50/40"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
        }`}
      >
        {isCurrentlyEditing ? (
          <div className="space-y-3">
            <div className="grid gap-2.5 sm:grid-cols-[1fr_170px_auto]">
              <div>
                <label htmlFor={`edit-task-${todoId}`} className="sr-only">
                  Edit task description
                </label>
                <input
                  id={`edit-task-${todoId}`}
                  className={`${inputClass} ${editError ? "border-rose-300 focus:border-rose-500" : ""}`}
                  value={editName}
                  maxLength={300}
                  disabled={isMutating}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (editError) setEditError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor={`edit-date-${todoId}`} className="sr-only">
                  Edit due date
                </label>
                <input
                  id={`edit-date-${todoId}`}
                  className={`${inputClass} ${editError && !editDate ? "border-rose-300 focus:border-rose-500" : ""}`}
                  type="date"
                  required
                  min={getTodayDateString()}
                  value={editDate}
                  disabled={isMutating}
                  onChange={(e) => {
                    setEditDate(e.target.value);
                    if (editError) setEditError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Save task changes"
                  disabled={isMutating || !editName.trim()}
                  className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  onClick={handleSaveEdit}
                >
                  <FiSave className="text-sm" /> Save
                </button>
                <button
                  type="button"
                  aria-label="Cancel editing"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-2.5 py-2 text-slate-600 hover:bg-slate-100 transition"
                  onClick={handleCancelEdit}
                >
                  <FiX className="text-sm" />
                </button>
              </div>
            </div>
            {editError && (
              <p className="text-xs font-medium text-rose-600">{editError}</p>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
            <button
              type="button"
              role="checkbox"
              aria-checked={completed}
              aria-label={
                completed
                  ? `Mark "${todoName}" as active`
                  : `Mark "${todoName}" as completed`
              }
              onClick={() => toggleItem(todoId)}
              className={`mt-0.5 sm:mt-0 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                completed
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-slate-300 bg-white text-transparent hover:border-blue-500 hover:bg-blue-50/50"
              }`}
            >
              <FiCheck className="text-sm stroke-[3]" />
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={`break-words text-sm sm:text-base leading-snug transition-colors ${
                  completed
                    ? "text-slate-400 line-through"
                    : "font-medium text-slate-800"
                }`}
              >
                {todoName}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                {dateBadge ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${dateBadge.badgeClass}`}
                  >
                    <FiCalendar className="text-[11px]" />
                    {dateBadge.label}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <FiClock className="text-[11px]" /> No due date
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {canEditTask(completed) && (
                <button
                  type="button"
                  aria-label={`Edit task "${todoName}"`}
                  title="Edit task"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onClick={handleStartEdit}
                >
                  <FiEdit2 className="text-sm" />
                </button>
              )}
              <button
                type="button"
                aria-label={`Delete task "${todoName}"`}
                title="Delete task"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <FiTrash2 className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </article>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${todoName}"? This action cannot be undone.`}
        confirmText="Delete Task"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default TodoItem;
