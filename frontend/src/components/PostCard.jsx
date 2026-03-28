import { Link } from "react-router-dom";
import DOMPurify from "dompurify";

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export default function PostCard({ post, compact = false, expandContent = false }) {
  return (
    <article
      className={[
        "group transition",
        compact
          ? "rounded-xl border border-ink/10 bg-[#fbfdff] p-4 hover:border-brand-200"
          : "rounded-2xl border border-white/60 bg-white p-5 shadow-soft hover:-translate-y-0.5"
      ].join(" ")}
    >
      <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
        {post.project_name ? <span className="rounded bg-brand-100 px-2 py-1 text-brand-700">{post.project_name}</span> : null}
        <span className="rounded bg-brand-100 px-2 py-1 text-brand-800">{post.category}</span>
        {post.erp_version ? <span className="rounded bg-ink/5 px-2 py-1 text-ink/70">Versao {post.erp_version}</span> : null}
        {post.erp_module ? <span className="rounded bg-ink/5 px-2 py-1 text-ink/70">{post.erp_module}</span> : null}
        {post.is_pinned ? <span className="rounded bg-amber-100 px-2 py-1 text-amber-700">Fixado</span> : null}
      </div>

      <h3 className="font-display text-xl font-bold text-ink">{post.title}</h3>
      {expandContent ? (
        <div
          className="wiki-content mt-3 text-sm leading-7 text-ink/85 [&_a]:font-semibold [&_a]:text-brand-700 [&_li]:my-1 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || "") }}
        />
      ) : !compact ? (
        <p className="mt-2 text-sm leading-6 text-ink/75">{post.summary}</p>
      ) : null}

      <div className="mt-4 flex items-center justify-between text-xs text-ink/60">
        <span>{post.author || "Equipe ERP"}</span>
        <span>{formatDate(post.published_at || post.created_at)}</span>
      </div>

      {!expandContent ? (
        <Link
          to={`/post/${post.slug || post.id}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700 group-hover:text-brand-800"
        >
          Ler comunicado
        </Link>
      ) : null}
    </article>
  );
}
