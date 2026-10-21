import { useRef, useContext } from "react";
import { FiPlus } from "react-icons/fi";
import { TodoContext } from "../store/TodoContext";

function AddTodo() {
  const { addNewItem } = useContext(TodoContext);
  const todoNameEl = useRef(null);
  const todoDateEl = useRef(null);

  const addButtonClick = (event) => {
    event.preventDefault();
    const todoName = todoNameEl.current.value.trim();
    const todoDate = todoDateEl.current.value;
    if (!todoName || !todoDate) return;
    addNewItem(todoName, todoDate);
    todoNameEl.current.value = "";
    todoDateEl.current.value = "";
    todoNameEl.current.focus();
  };

  const inputClass =
    "min-w-0 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <form
      className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]"
      onSubmit={addButtonClick}
    >
      <label className="sr-only" htmlFor="todo-name">
        Task name
      </label>
      <input
        id="todo-name"
        className={inputClass}
        type="text"
        placeholder="What needs to get done?"
        ref={todoNameEl}
        required
        maxLength={180}
      />
      <label className="sr-only" htmlFor="todo-date">
        Due date
      </label>
      <input
        id="todo-date"
        className={inputClass}
        type="date"
        ref={todoDateEl}
        required
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 active:scale-[0.98]"
      >
        <FiPlus className="text-base" /> Add task
      </button>
    </form>
  );
}

export default AddTodo;
