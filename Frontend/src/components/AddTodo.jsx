import { useState, useContext, useRef } from "react";
import { FiPlus, FiLoader } from "react-icons/fi";
import { TodoContext } from "../store/TodoContext";
import {
  getTodayDateString,
  extractCalendarDate,
  isDateTodayOrFuture,
} from "../utils/dateUtils";

function AddTodo() {
  const { addNewItem, isMutating } = useContext(TodoContext);
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [validationError, setValidationError] = useState("");
  const inputRef = useRef(null);
  const todayStr = getTodayDateString();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = taskName.trim();

    if (!trimmed) {
      setValidationError("Please enter a task description.");
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length > 300) {
      setValidationError("Task description cannot exceed 300 characters.");
      return;
    }

    const cleanDate = extractCalendarDate(dueDate);
    if (!cleanDate) {
      setValidationError("Please select a due date.");
      return;
    }

    if (!isDateTodayOrFuture(cleanDate)) {
      setValidationError("Due date cannot be earlier than today.");
      return;
    }

    setValidationError("");
    const success = await addNewItem(trimmed, cleanDate);
    if (success) {
      setTaskName("");
      setDueDate("");
      inputRef.current?.focus();
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400";

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
        <div>
          <label htmlFor="new-todo-task" className="sr-only">
            Task Description
          </label>
          <input
            id="new-todo-task"
            ref={inputRef}
            type="text"
            className={`${inputClass} ${validationError && !taskName.trim() ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""}`}
            placeholder="What needs to get done?"
            value={taskName}
            maxLength={300}
            disabled={isMutating}
            onChange={(e) => {
              setTaskName(e.target.value);
              if (validationError) setValidationError("");
            }}
          />
        </div>

        <div>
          <label htmlFor="new-todo-date" className="sr-only">
            Due Date (Required)
          </label>
          <div className="relative">
            <input
              id="new-todo-date"
              type="date"
              required
              min={todayStr}
              className={`${inputClass} ${validationError && !dueDate ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""}`}
              value={dueDate}
              disabled={isMutating}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (validationError) setValidationError("");
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isMutating || !taskName.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-3 focus:ring-blue-200"
        >
          {isMutating ? (
            <>
              <FiLoader className="animate-spin text-base" /> Adding...
            </>
          ) : (
            <>
              <FiPlus className="text-base" /> Add Task
            </>
          )}
        </button>
      </div>

      {validationError && (
        <p className="text-xs font-medium text-rose-600 animate-fadeIn">
          {validationError}
        </p>
      )}
    </form>
  );
}

export default AddTodo;
