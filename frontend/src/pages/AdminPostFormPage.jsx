import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import api from "../services/api";

const categories = ["atualizacao", "correcao", "recurso", "financeiro", "sistema", "comunicado"];
const modules = ["financeiro", "estoque", "vendas", "fiscal", "compras", "rh", "crm"];

export default function AdminPostFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    project_id: "",
    category: categories[0],
    status: "publicado",
    is_featured: false,
    is_pinned: false,
    erp_version: "",
    erp_module: ""
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [projectsRes, postRes] = await Promise.all([
          api.get("/admin/projects"),
          isEdit ? api.get(`/posts/${id}/private`) : Promise.resolve({ data: null })
        ]);

        if (!mounted) return;
        setProjects(projectsRes.data || []);

        if (postRes.data) {
          const data = postRes.data;
          setForm({
            title: data.title || "",
            summary: data.summary || "",
            content: data.content || "",
            project_id: data.project_id ? String(data.project_id) : "",
            category: data.category || categories[0],
            status: data.status || "publicado",
            is_featured: Boolean(data.is_featured),
            is_pinned: Boolean(data.is_pinned),
            erp_version: data.erp_version || "",
            erp_module: data.erp_module || ""
          });
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Nao foi possivel carregar os dados.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          payload.append(key, value ? "1" : "0");
        } else {
          payload.append(key, value ?? "");
        }
      });
      if (image) payload.append("image", image);

      if (isEdit) {
        await api.put(`/admin/posts/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/admin/posts", payload, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || "Falha ao salvar postagem.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-ink/70">Carregando dados...</p>;

  return (
    <section className="rounded-2xl border border-white/70 bg-white p-5 shadow-soft md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-ink">{isEdit ? "Editar postagem" : "Nova postagem"}</h1>
        <Link to="/admin" className="text-sm font-bold text-brand-700">
          Voltar
        </Link>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Titulo</span>
          <input
            required
            className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Resumo</span>
          <textarea
            className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
            rows={3}
            value={form.summary}
            onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Projeto (aba)</span>
            <select
              className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
              value={form.project_id}
              onChange={(e) => setForm((prev) => ({ ...prev, project_id: e.target.value }))}
            >
              <option value="">Sem projeto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Categoria</span>
            <select
              className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Status</span>
            <select
              className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="publicado">publicado</option>
              <option value="rascunho">rascunho</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Versao ERP (opcional)</span>
            <input
              placeholder="Ex: 3.8.1"
              className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
              value={form.erp_version}
              onChange={(e) => setForm((prev) => ({ ...prev, erp_version: e.target.value }))}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Modulo ERP</span>
            <select
              className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm outline-none ring-brand-500 focus:ring"
              value={form.erp_module}
              onChange={(e) => setForm((prev) => ({ ...prev, erp_module: e.target.value }))}
            >
              <option value="">Selecione um modulo</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Conteudo (editor rico)</span>
          <ReactQuill theme="snow" value={form.content} onChange={(value) => setForm((prev) => ({ ...prev, content: value }))} />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/70">Imagem de capa</span>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </label>

        <div className="flex flex-wrap gap-5">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
            />
            Destacar postagem
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => setForm((prev) => ({ ...prev, is_pinned: e.target.checked }))}
            />
            Fixar no topo
          </label>
        </div>

        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-800 disabled:opacity-70"
        >
          {saving ? "Salvando..." : "Salvar postagem"}
        </button>
      </form>
    </section>
  );
}
