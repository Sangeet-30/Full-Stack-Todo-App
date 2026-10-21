import { useContext, useState, useMemo } from "react";
import {
  FiCheckCircle,
  FiCircle,
  FiList,
  FiTrash2,
  FiSearch,
  FiInbox,
  FiX,
} from "react-icons/fi";
import TodoItem from "./TodoItem";
import ConfirmModal from "./ConfirmModal";
import { TodoContext } from "../store/TodoContext";

const TodoItems = () => {
  const { todoItems, clearCompleted, isLoading } = useContext(TodoContext);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isClearCompletedModalOpen, setIsClearCompletedModalOpen] =
    useState(false);

  const totalTodos = todoItems.length;
  const completedTodos = todoItems.filter((item) => item.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const completionPercentage = totalTodos
    ? Math.round((completedTodos / totalTodos) * 100)
    : 0;

  const filteredItems = useMemo(() => {
    return todoItems
      .filter((item) => {
        if (filter === "active") return !item.completed;
        if (filter === "completed") return item.completed;
        return true;
      })
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        return item.name
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());
      });
  }, [todoItems, filter, searchQuery]);

  const filters = [
    { id: "all", label: "All Tasks", count: totalTodos },
    { id: "active", label: "Active", count: activeTodos },
    { id: "completed", label: "Completed", count: completedTodos },
  ];

  const handleConfirmClearCompleted = async () => {
    setIsClearCompletedModalOpen(false);
    await clearCompleted();
  };

  return (
    <section aria-label="Todo task list" className="mt-4">
      {/* Metric Cards */}
      <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 sm:p-4 transition hover:border-slate-300">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <FiList className="text-slate-400" />
            <span>Total</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {totalTodos}
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 sm:p-4 transition hover:border-blue-200">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-blue-600">
            <FiCircle className="text-blue-500" />
            <span>Active</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-blue-700">
            {activeTodos}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 sm:p-4 transition hover:border-emerald-200">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <FiCheckCircle className="text-emerald-500" />
            <span>Done</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700">
            {completedTodos}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {totalTodos > 0 && (
        <div className="mb-6 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Completion Rate</span>
            <span className="font-semibold text-slate-800">
              {completionPercentage}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80"
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Toolbar: Search, Filters & Clear Completed */}
      <div className="mb-5 space-y-3">
        {totalTodos > 0 && (
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              aria-label="Search tasks"
              placeholder="Filter tasks by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <FiX className="text-xs" />
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1"
          >
            {filters.map(({ id, label, count }) => {
              const isActive = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={() => setFilter(id)}
                >
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {completedTodos > 0 && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition active:scale-98"
              onClick={() => setIsClearCompletedModalOpen(true)}
            >
              <FiTrash2 className="text-xs" />
              <span>Clear Completed ({completedTodos})</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="animate-pulse rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/4 rounded bg-slate-100" />
                </div>
                <div className="h-8 w-16 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        /* Task List */
        <div className="space-y-2.5">
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
        /* Empty States */
        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/40 px-5 py-12 text-center sm:py-16">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
            {searchQuery ? (
              <FiSearch />
            ) : filter === "completed" ? (
              <FiCheckCircle />
            ) : (
              <FiInbox />
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {searchQuery
              ? "No matching tasks found"
              : totalTodos === 0
                ? "No tasks yet"
                : filter === "active"
                  ? "All caught up!"
                  : "Nothing completed yet"}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs sm:text-sm text-slate-500 leading-relaxed">
            {searchQuery
              ? `No tasks match "${searchQuery}". Try a different keyword.`
              : totalTodos === 0
                ? "Add your first task above to start planning your day."
                : filter === "active"
                  ? "You have completed all pending tasks. Great job!"
                  : "Tasks marked as completed will appear here."}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Clear search filter
            </button>
          )}
        </div>
      )}

      {/* Clear Completed Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearCompletedModalOpen}
        title="Clear Completed Tasks"
        message={`Are you sure you want to permanently delete all ${completedTodos} completed tasks?`}
        confirmText="Clear All Completed"
        confirmVariant="danger"
        onConfirm={handleConfirmClearCompleted}
        onCancel={() => setIsClearCompletedModalOpen(false)}
      />
    </section>
  );
};

export default TodoItems;
