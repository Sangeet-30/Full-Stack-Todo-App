import { useContext, useState } from "react";
import { FiCheckCircle, FiCircle, FiList, FiTrash2 } from "react-icons/fi";
import TodoItem from "./TodoItem";
import { TodoContext } from "../store/TodoContext";

const TodoItems = () => {
  const { todoItems, clearCompleted } = useContext(TodoContext);
  const [filter, setFilter] = useState("all");
  const filteredItems = todoItems.filter((item) =>
    filter === "active"
      ? !item.completed
      : filter === "completed"
        ? item.completed
        : true,
  );
  const totalTodos = todoItems.length;
  const completedTodos = todoItems.filter((item) => item.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const completion = totalTodos
    ? Math.round((completedTodos / totalTodos) * 100)
    : 0;
  const filters = [
    { id: "all", label: "All tasks", count: totalTodos },
    { id: "active", label: "Active", count: activeTodos },
    { id: "completed", label: "Completed", count: completedTodos },
  ];

  return (
    <section aria-label="Your tasks">
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <FiList /> Total
          </div>
          <p className="text-2xl font-semibold text-slate-900">{totalTodos}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <FiCircle /> Active
          </div>
          <p className="text-2xl font-semibold text-blue-600">{activeTodos}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <FiCheckCircle /> Done
          </div>
          <p className="text-2xl font-semibold text-emerald-600">
            {completedTodos}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {filters.map(({ id, label, count }) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition sm:text-sm ${filter === id ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              onClick={() => setFilter(id)}
            >
              {label}
              <span
                className={`ml-1.5 ${filter === id ? "text-blue-600" : "text-slate-400"}`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
        {completedTodos > 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-2 self-start rounded-lg px-2 py-2 text-xs font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 sm:self-auto"
            onClick={clearCompleted}
          >
            <FiTrash2 /> Clear completed
          </button>
        )}
      </div>

      {totalTodos > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Overall progress</span>
            <span>{completion}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      )}

      {filteredItems.length ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <TodoItem
              key={item.id}
              todoId={item.id}
              todoName={item.name}
              todoDate={item.dueDate}
              completed={item.completed}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center sm:py-12">
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xl text-blue-600">
            <FiCheckCircle />
          </div>
          <h3 className="font-semibold text-slate-800">
            {totalTodos === 0
              ? "No tasks yet"
              : filter === "active"
                ? "All caught up"
                : "Nothing completed yet"}
          </h3>
          <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-slate-500">
            {totalTodos === 0
              ? "Add your first task above to get started."
              : filter === "active"
                ? "There are no active tasks right now."
                : "Completed tasks will appear here."}
          </p>
        </div>
      )}
    </section>
  );
};

export default TodoItems;
