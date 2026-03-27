import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import PostCard from "../components/PostCard";

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
    <section className="space-y-8">
      <div className="grid gap-6 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft md:grid-cols-[1.4fr_1fr] md:p-8">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Portal corporativo ERP</p>
          <h1 className="font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
            Comunicados, melhorias e atualizações do sistema em um só lugar
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/70 md:text-base">
            Publique novidades para clientes e equipe interna com foco em comunicação clara: versão, módulo, impacto e ações
            recomendadas.
          </p>
        </div>

        <div className="rounded-2xl bg-brand-900 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Atualização recente do sistema</p>
          {highlights[0] ? (
            <>
              <h2 className="mt-2 font-display text-2xl font-semibold">{highlights[0].title}</h2>
              <p className="mt-2 text-sm text-white/80">{highlights[0].summary}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/80">Nenhum destaque cadastrado até o momento.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white p-4 shadow-soft">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">Projetos</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, project: "" }))}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              !filters.project ? "bg-brand-700 text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
            }`}
          >
            Todos
          </button>
          {meta.projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, project: String(project.id) }))}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filters.project === String(project.id) ? "bg-brand-700 text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/70 bg-white p-4 md:grid-cols-4 md:p-5">
        <input
          className="rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
          placeholder="Buscar por palavra-chave"
          value={filters.q}
          onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
        />
        <select
          className="rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
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
          className="rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
          value={filters.module}
          onChange={(e) => setFilters((prev) => ({ ...prev, module: e.target.value }))}
        >
          <option value="">Todos módulos</option>
          {meta.modules.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
          value={filters.version}
          onChange={(e) => setFilters((prev) => ({ ...prev, version: e.target.value }))}
        >
          <option value="">Todas versões</option>
          {meta.versions.map((version) => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-2xl font-bold text-ink">Destaques</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {highlights.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} compact />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-2xl font-bold text-ink">Novidades e comunicados</h2>
        {loading ? (
          <p className="text-sm text-ink/70">Carregando postagens...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-ink/70">Nenhuma postagem encontrada com os filtros selecionados.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
