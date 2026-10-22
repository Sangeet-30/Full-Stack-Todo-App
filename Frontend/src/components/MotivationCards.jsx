import { FiCheckCircle, FiList, FiTarget } from "react-icons/fi";

function MotivationCards() {
  return (
    <section
      aria-label="Productivity tips"
      className="mb-6 grid gap-3 sm:grid-cols-3"
    >
      <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-slate-300">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-lg text-blue-600">
          <FiList />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            Stay focused
          </p>
          <p className="text-sm font-semibold text-slate-800 truncate">
            One task at a time
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-slate-300">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-lg text-violet-600">
          <FiTarget />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            Make progress
          </p>
          <p className="text-sm font-semibold text-slate-800 truncate">
            Small steps add up
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-slate-300">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
          <FiCheckCircle />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            Build momentum
          </p>
          <p className="text-sm font-semibold text-slate-800 truncate">
            Celebrate each win
          </p>
        </div>
      </div>
    </section>
  );
}

export default MotivationCards;

