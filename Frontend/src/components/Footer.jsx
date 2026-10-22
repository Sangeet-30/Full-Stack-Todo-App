import { FiGithub } from "react-icons/fi";

const Footer = () => (
  <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-200/80 mt-10">
    <div className="flex flex-col items-center gap-2">
      <p className="text-slate-500">
        Full-Stack Todo App · Built with{" "}
        <span className="text-slate-700 font-medium">React 19</span>,{" "}
        <span className="text-slate-700 font-medium">Tailwind CSS</span>,{" "}
        <span className="text-slate-700 font-medium">Express</span> &{" "}
        <span className="text-slate-700 font-medium">MongoDB</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-slate-500">
        <span>
          Built by <strong className="font-semibold text-slate-700">Sangeet</strong>
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>© 2026 TodoFlow. All rights reserved.</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <a
          href="https://github.com/Sangeet-30"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-blue-600 transition underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          aria-label="Sangeet GitHub profile (opens in a new tab)"
        >
          <FiGithub className="inline-block text-xs" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
