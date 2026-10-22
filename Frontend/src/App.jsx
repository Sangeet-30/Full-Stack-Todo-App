import { useState } from "react";
import { FiLoader } from "react-icons/fi";
import AppName from "./components/AppName";
import MotivationCards from "./components/MotivationCards";
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
          <MotivationCards />

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
