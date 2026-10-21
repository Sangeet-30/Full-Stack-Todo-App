import { FiCheckCircle, FiList, FiTarget } from "react-icons/fi";
import AppName from "./components/AppName";
import AddTodo from "./components/AddTodo";
import TodoItems from "./components/TodoItems";
import TodoContextProvider from "./store/TodoContext-store";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <TodoContextProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12">
          <header className="mb-8">
            <AppName />
          </header>

          <section className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-lg text-blue-600">
                <FiList />
              </span>
              <div>
                <p className="text-xs text-slate-500">Stay focused</p>
                <p className="text-sm font-semibold text-slate-800">
                  One task at a time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-50 text-lg text-violet-600">
                <FiTarget />
              </span>
              <div>
                <p className="text-xs text-slate-500">Make progress</p>
                <p className="text-sm font-semibold text-slate-800">
                  Small steps add up
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-lg text-emerald-600">
                <FiCheckCircle />
              </span>
              <div>
                <p className="text-xs text-slate-500">Build momentum</p>
                <p className="text-sm font-semibold text-slate-800">
                  Celebrate each win
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Your tasks
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a task and keep your day organized.
              </p>
            </div>
            <AddTodo />
            <TodoItems />
          </section>
          <div className="mt-auto pt-8">
            <Footer />
          </div>
        </main>
      </div>
    </TodoContextProvider>
  );
}

export default App;
