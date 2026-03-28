import { useEffect, useMemo, useState } from "react";
import PostCard from "../components/PostCard";
import api from "../services/api";

function formatDate(value) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [meta, setMeta] = useState({ categories: [], modules: [], versions: [], projects: [] });
  const [filters, setFilters] = useState({ q: "", category: "", module: "", version: "", project: "" });
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const [postsRes, highlightsRes, metaRes] = await Promise.all([
          api.get(`/posts${query ? `?${query}` : ""}`),
          api.get("/posts/highlights"),
          api.get("/posts/meta")
        ]);

        if (!mounted) return;
        setPosts(postsRes.data);
        setHighlights(highlightsRes.data);
        setMeta(metaRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-soft">
        <div className="relative p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(37,89,216,0.20),transparent_45%),radial-gradient(circle_at_10%_100%,rgba(23,33,47,0.10),transparent_45%)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">SeNews Knowledge Base</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">Versoes, melhorias e comunicados</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70 md:text-base">
                Um formato simples de leitura, inspirado em wiki de versoes, com visual mais atual para facilitar busca,
                triagem e acompanhamento de entregas.
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm">
              <p className="text-ink/60">Total de registros</p>
              <p className="font-display text-3xl font-bold text-ink">{posts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/70 bg-white p-4 shadow-soft">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">Navegacao</p>
            <div className="space-y-2 text-sm">
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, project: "" }))}
                className={`w-full rounded-xl px-3 py-2 text-left transition ${
                  !filters.project ? "bg-brand-700 text-white" : "bg-ink/5 text-ink/75 hover:bg-ink/10"
                }`}
              >
                Todos os projetos
              </button>
              {meta.projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, project: String(project.id) }))}
                  className={`w-full rounded-xl px-3 py-2 text-left transition ${
                    filters.project === String(project.id) ? "bg-brand-700 text-white" : "bg-ink/5 text-ink/75 hover:bg-ink/10"
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white p-4 shadow-soft">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">Filtros</p>
            <div className="space-y-3">
              <input
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
                placeholder="Buscar por palavra-chave"
                value={filters.q}
                onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              />
              <select
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Todas categorias</option>
                {meta.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
                value={filters.module}
                onChange={(e) => setFilters((prev) => ({ ...prev, module: e.target.value }))}
              >
                <option value="">Todos modulos</option>
                {meta.modules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
              <select
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
                value={filters.version}
                onChange={(e) => setFilters((prev) => ({ ...prev, version: e.target.value }))}
              >
                <option value="">Todas versoes</option>
                {meta.versions.map((version) => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {(highlights.length ? highlights.slice(0, 2) : [{ id: "empty" }]).map((post, index) => (
              <article
                key={post.id || index}
                className="rounded-2xl border border-white/70 bg-[linear-gradient(150deg,#1f48af,#233361)] p-5 text-white shadow-soft"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Destaque</p>
                <h2 className="mt-2 font-display text-xl font-bold">{post.title || "Sem destaque cadastrado"}</h2>
                <p className="mt-2 text-sm text-white/80">{post.summary || "Publique uma postagem e marque como destaque."}</p>
              </article>
            ))}
          </div>

          <section className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-soft">
            <div className="border-b border-ink/10 bg-[#f6f9ff] px-5 py-4">
              <h2 className="font-display text-2xl font-bold text-ink">Historico de versoes</h2>
            </div>
            {loading ? (
              <p className="px-5 py-6 text-sm text-ink/70">Carregando postagens...</p>
            ) : posts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink/70">Nenhuma postagem encontrada com os filtros selecionados.</p>
            ) : (
              <div className="divide-y divide-ink/10">
                {posts.map((post) => (
                  <div key={post.id} className="px-5 py-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/60">
                      {post.project_name ? <span>{post.project_name}</span> : null}
                      {post.erp_version ? <span>versao {post.erp_version}</span> : null}
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                    <PostCard post={post} compact expandContent />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
