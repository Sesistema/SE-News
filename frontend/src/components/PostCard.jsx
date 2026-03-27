import { Link } from "react-router-dom";

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export default function PostCard({ post, compact = false }) {
  return (
    <article className="group rounded-2xl border border-white/60 bg-white p-5 shadow-soft transition hover:-translate-y-0.5">
      <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
        <span className="rounded bg-brand-100 px-2 py-1 text-brand-800">{post.category}</span>
        {post.erp_version ? <span className="rounded bg-ink/5 px-2 py-1 text-ink/70">Versão {post.erp_version}</span> : null}
        {post.erp_module ? <span className="rounded bg-ink/5 px-2 py-1 text-ink/70">{post.erp_module}</span> : null}
        {post.is_pinned ? <span className="rounded bg-amber-100 px-2 py-1 text-amber-700">Fixado</span> : null}
      </div>

      <h3 className="font-display text-xl font-bold text-ink">{post.title}</h3>
      {!compact ? <p className="mt-2 text-sm leading-6 text-ink/75">{post.summary}</p> : null}

      <div className="mt-4 flex items-center justify-between text-xs text-ink/60">
        <span>{post.author || "Equipe ERP"}</span>
        <span>{formatDate(post.published_at || post.created_at)}</span>
      </div>

      <Link
        to={`/post/${post.slug || post.id}`}
        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700 group-hover:text-brand-800"
      >
        Ler comunicado
      </Link>
    </article>
  );
}
