import { FiCheckSquare } from "react-icons/fi";

function AppName() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-xl text-white">
          <FiCheckSquare />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Plan · Do · Done
        </span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Todo<span className="text-blue-600">Flow</span>
      </h1>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
        A simple place to plan your work and get things done.
      </p>
    </div>
  );
}

export default AppName;
