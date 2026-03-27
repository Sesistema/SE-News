import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-soft md:p-8">
      <h1 className="font-display text-3xl font-bold text-ink">Acesso administrativo</h1>
      <p className="mt-2 text-sm text-ink/70">Entre com seu usuario administrador para gerenciar postagens da SeNews.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/70">E-mail</span>
          <input
            type="email"
            required
            className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Senha</span>
          <input
            type="password"
            required
            className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
        </label>

        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-brand-800 disabled:opacity-70"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
