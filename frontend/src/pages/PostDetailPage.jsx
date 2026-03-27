import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import api from "../services/api";

function imageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseApi = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  const origin = baseApi.replace("/api", "");
  return `${origin}${path}`;
}

export default function PostDetailPage() {
  const { slugOrId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const { data } = await api.get(`/posts/${slugOrId}`);
        if (!mounted) return;
        setPost(data);
      } catch (err) {
        if (!mounted) return;
        setError("Postagem não encontrada.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [slugOrId]);

  if (loading) return <p className="text-sm text-ink/70">Carregando...</p>;
  if (error) return <p className="text-sm font-semibold text-red-600">{error}</p>;

  return (
    <article className="mx-auto max-w-4xl rounded-3xl border border-white/70 bg-white p-6 shadow-soft md:p-10">
      <Link to="/" className="mb-5 inline-flex text-sm font-bold text-brand-700">
        Voltar para início
      </Link>
      <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
        {post.project_name ? <span className="rounded bg-brand-100 px-2 py-1 text-brand-700">{post.project_name}</span> : null}
        <span className="rounded bg-brand-100 px-2 py-1 text-brand-800">{post.category}</span>
        {post.erp_version ? <span className="rounded bg-ink/5 px-2 py-1 text-ink/70">Versão {post.erp_version}</span> : null}
        {post.erp_module ? <span className="rounded bg-ink/5 px-2 py-1 text-ink/70">{post.erp_module}</span> : null}
      </div>
      <h1 className="font-display text-3xl font-bold text-ink">{post.title}</h1>
      <p className="mt-2 text-sm text-ink/60">
        {post.author || "Equipe ERP"} • {new Date(post.published_at || post.created_at).toLocaleDateString("pt-BR")}
      </p>

      {post.image_url ? (
        <img src={imageUrl(post.image_url)} alt={post.title} className="mt-6 max-h-[380px] w-full rounded-2xl object-cover" />
      ) : null}

      <div
        className="wiki-content mt-6 text-[15px] leading-7 text-ink/90 [&_a]:font-semibold [&_a]:text-brand-700 [&_h1]:font-display [&_h1]:text-3xl [&_h2]:font-display [&_h2]:text-2xl [&_h3]:font-display [&_h3]:text-xl [&_li]:my-1 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
      />
    </article>
  );
}
