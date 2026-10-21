import { useContext, useState } from "react";
import {
  FiCalendar,
  FiCheck,
  FiEdit2,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { TodoContext } from "../store/TodoContext";

const TodoItem = ({ todoName, todoDate, todoId, completed }) => {
  const { deleteItem, toggleItem, editItem } = useContext(TodoContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(todoName);
  const [editDate, setEditDate] = useState(todoDate);
  const inputClass =
    "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const saveEdit = () => {
    if (!editName.trim() || !editDate) return;
    editItem(todoId, editName.trim(), editDate);
    setIsEditing(false);
  };

  return (
    <article
      className={`rounded-xl border p-4 transition sm:p-4 ${completed ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white hover:border-slate-300"}`}
    >
      {isEditing ? (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_auto]">
          <input
            aria-label="Edit task name"
            className={inputClass}
            value={editName}
            maxLength={180}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
            autoFocus
          />
          <input
            aria-label="Edit due date"
            className={inputClass}
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Save task"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:flex-none"
              onClick={saveEdit}
            >
              <FiSave /> Save
            </button>
            <button
              type="button"
              aria-label="Cancel editing"
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600 transition hover:bg-slate-100"
              onClick={() => {
                setEditName(todoName);
                setEditDate(todoDate);
                setIsEditing(false);
              }}
            >
              <FiX />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <button
            type="button"
            aria-label={completed ? "Mark task active" : "Mark task completed"}
            aria-pressed={completed}
            onClick={() => toggleItem(todoId)}
            className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition sm:mt-0 ${completed ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 text-transparent hover:border-blue-500 hover:bg-blue-50"}`}
          >
            <FiCheck className="text-sm" />
          </button>
          <div className="min-w-0 flex-1">
            <p
              className={`break-words text-sm font-medium leading-6 sm:text-base ${completed ? "text-slate-400 line-through" : "text-slate-800"}`}
            >
              {todoName}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <FiCalendar /> Due {todoDate || "No date"}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label="Edit task"
              title="Edit task"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setIsEditing(true)}
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              aria-label="Delete task"
              title="Delete task"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
              onClick={() => deleteItem(todoId)}
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default TodoItem;
