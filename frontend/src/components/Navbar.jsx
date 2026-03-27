import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const baseItemClass = "text-sm font-semibold tracking-wide text-ink/70 hover:text-brand-700";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-ink/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="font-display text-xl font-bold text-ink">
          Wiki<span className="text-brand-600">ERP</span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-7">
          <NavLink to="/" className={baseItemClass}>
            Início
          </NavLink>
          <NavLink to="/" className={baseItemClass}>
            Novidades
          </NavLink>
          <NavLink to="/" className={baseItemClass}>
            Categorias
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/admin" className={baseItemClass}>
                Painel
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-ink px-3 py-2 text-xs font-bold uppercase tracking-wider text-white"
              >
                Sair
              </button>
            </>
          ) : (
            <NavLink to="/login" className={baseItemClass}>
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
