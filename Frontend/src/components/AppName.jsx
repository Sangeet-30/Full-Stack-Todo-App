import { FiCheckSquare, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../store/AuthContext";

function AppName() {
  const { user, logout } = useAuth();

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

      {user && (
        <div className="flex items-center gap-3 self-start sm:self-center bg-white border border-slate-200/80 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-2xs animate-fadeIn">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
          </div>
          <div className="min-w-0 pr-1 sm:pr-2">
            <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[180px]">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">
              {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <FiLogOut className="text-base" />
          </button>
        </div>
      )}
    </div>
  );
}

export default AppName;
