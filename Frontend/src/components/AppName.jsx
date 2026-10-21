import { FiCheckSquare } from "react-icons/fi";

function AppName() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1">
          <span className="grid h-4 w-4 place-items-center text-blue-600">
            <FiCheckSquare className="text-sm" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            Plan · Do · Done
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Todo<span className="text-blue-600">Flow</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-md leading-relaxed">
          A minimalist task manager to stay organized, prioritize goals, and build daily momentum.
        </p>
      </div>
    </div>
  );
}

export default AppName;
