import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function statusBadge(status) {
  if (status === "publicado") return "bg-brand-100 text-brand-800";
  return "bg-amber-100 text-amber-700";
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const [postsRes, logsRes] = await Promise.all([api.get("/admin/posts"), api.get("/admin/logs")]);
      setPosts(postsRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm("Deseja realmente excluir esta postagem?");
    if (!confirmed) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      await load();
    } catch (error) {
      alert(error?.response?.data?.message || "Não foi possível excluir.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Área administrativa</p>
          <h1 className="font-display text-3xl font-bold text-ink">Olá, {user?.name}</h1>
        </div>
        <Link
          to="/admin/novo"
          className="rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-800"
        >
          Nova postagem
        </Link>
      </div>

      <section className="rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
        <h2 className="mb-4 font-display text-2xl font-bold text-ink">Postagens</h2>
        {loading ? (
          <p className="text-sm text-ink/70">Carregando...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-ink/70">Nenhuma postagem cadastrada.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/60">
                  <th className="px-3 py-2">Título</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Versão</th>
                  <th className="px-3 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-ink/5">
                    <td className="px-3 py-3 font-semibold text-ink">{post.title}</td>
                    <td className="px-3 py-3 text-ink/70">{post.category}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-bold uppercase ${statusBadge(post.status)}`}>{post.status}</span>
                    </td>
                    <td className="px-3 py-3 text-ink/70">{post.erp_version || "-"}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <Link to={`/admin/editar/${post.id}`} className="rounded bg-ink/10 px-2 py-1 text-xs font-bold text-ink">
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
        <h2 className="mb-4 font-display text-2xl font-bold text-ink">Logs de alterações</h2>
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="rounded-xl border border-ink/10 px-4 py-3 text-sm">
              <p className="font-semibold text-ink">
                {log.user_name || "Admin"} • {log.action}
              </p>
              <p className="text-ink/70">{log.details}</p>
              <p className="text-xs text-ink/50">{new Date(log.created_at).toLocaleString("pt-BR")}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
