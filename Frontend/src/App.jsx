import { useState } from "react";
import { FiCheckCircle, FiList, FiTarget, FiLoader } from "react-icons/fi";
import AppName from "./components/AppName";
import AddTodo from "./components/AddTodo";
import TodoItems from "./components/TodoItems";
import TodoContextProvider from "./store/TodoContext-store";
import AuthProvider from "./store/AuthProvider";
import { useAuth } from "./store/AuthContext";
import NotificationBanner from "./components/NotificationBanner";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

function AppContent() {
  const { user, isAuthLoading } = useAuth();
  const [authView, setAuthView] = useState("login");
  const [authSuccessMessage, setAuthSuccessMessage] = useState("");

  const handleSwitchToRegister = () => {
    setAuthSuccessMessage("");
    setAuthView("register");
  };

  const handleSwitchToLogin = () => {
    setAuthSuccessMessage("");
    setAuthView("login");
  };

  const handleRegisterSuccess = (msg) => {
    setAuthSuccessMessage(msg || "Account created successfully. Please log in.");
    setAuthView("login");
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md animate-pulse">
            <FiLoader className="text-xl animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  const isAuthenticated = Boolean(user && user.id && user.email);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12">
          <header className="mb-8">
            <AppName />
          </header>

          <div className="my-auto py-6">
            {authView === "login" ? (
              <Login
                onSwitchToRegister={handleSwitchToRegister}
                successMessage={authSuccessMessage}
              />
            ) : (
              <Register
                onSwitchToLogin={handleSwitchToLogin}
                onRegisterSuccess={handleRegisterSuccess}
              />
            )}
          </div>

          <div className="mt-auto">
            <Footer />
          </div>
        </main>
      </div>
    );
  }

  return (
    <TodoContextProvider>
      <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12">
          {/* Header */}
          <header className="mb-6">
            <AppName />
          </header>

          {/* Value Props / Motivation Cards */}
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

          {/* Notification / Alert Area */}
          <NotificationBanner />

          {/* Main Todo Card */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-6 sm:shadow-sm">
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Tasks
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                  Plan today's priorities and track completed goals.
                </p>
              </div>
            </div>

            <AddTodo />
            <TodoItems />
          </section>

          {/* Footer */}
          <div className="mt-auto">
            <Footer />
          </div>
        </main>
      </div>
    </TodoContextProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
