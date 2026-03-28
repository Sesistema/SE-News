import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function menuClass({ isActive }) {
  return [
    "rounded-full px-3 py-1.5 text-sm font-semibold transition",
    isActive ? "bg-brand-700 text-white" : "text-ink/70 hover:bg-white hover:text-ink"
  ].join(" ");
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [logoSrc, setLogoSrc] = useState("/assets/logo-transparent.png");

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-[#eef3fb]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt="SeNews"
            className="h-10 w-auto rounded-md object-contain"
            onError={() => setLogoSrc("/assets/logo-white-bg.jpeg")}
          />
          <div>
            <p className="font-display text-xl font-bold leading-none text-ink">
              Se<span className="text-brand-700">News</span>
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">Base de versoes ERP</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          <NavLink to="/" className={menuClass}>
            Pagina
          </NavLink>
          <NavLink to="/" className={menuClass}>
            Versoes
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/admin" className={menuClass}>
                Painel
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
              >
                Sair
              </button>
            </>
          ) : (
            <NavLink to="/login" className={menuClass}>
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
