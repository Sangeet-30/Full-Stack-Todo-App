import { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiLogIn, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../store/AuthContext";

function Login({ onSwitchToRegister, successMessage }) {
  const { login, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    clearAuthError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (!password || !password.trim()) {
      setValidationError("Please enter your password.");
      return;
    }

    setValidationError("");
    setIsSubmitting(true);

    try {
      await login(trimmedEmail, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-50";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your tasks and stay organized.
          </p>
        </div>

        {successMessage && !validationError && !authError && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs sm:text-sm font-medium text-emerald-800 animate-fadeIn"
          >
            <FiCheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="flex-1">{successMessage}</p>
          </div>
        )}

        {(validationError || authError) && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs sm:text-sm font-medium text-rose-700 animate-fadeIn"
          >
            <FiAlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <p className="flex-1">{validationError || authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                placeholder="name@example.com"
                value={email}
                disabled={isSubmitting}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError("");
                  if (authError) clearAuthError();
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className={inputClass}
                placeholder="••••••••"
                value={password}
                disabled={isSubmitting}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationError) setValidationError("");
                  if (authError) clearAuthError();
                }}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-blue-200 mt-2"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin text-base" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <FiLogIn className="text-base" />
                <span>Sign in</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <span>Don&apos;t have an account? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

