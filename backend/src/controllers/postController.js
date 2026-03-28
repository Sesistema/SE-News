const pool = require("../config/db");
const slugify = require("../utils/slugify");
const { stripHtml } = require("../utils/text");

const ERP_CATEGORIES = ["atualizacao", "correcao", "recurso", "financeiro", "sistema", "comunicado"];

function normalizeStatus(status) {
  return status === "publicado" ? "publicado" : "rascunho";
}

function mapPost(post) {
  return {
    ...post,
    is_featured: Boolean(post.is_featured),
    is_pinned: Boolean(post.is_pinned),
    summary: post.summary || stripHtml(post.content).slice(0, 220)
  };
}

async function resolveProjectId(rawProjectId) {
  if (!rawProjectId) return null;
  const projectId = Number(rawProjectId);
  if (!Number.isInteger(projectId) || projectId <= 0) return null;

  const [rows] = await pool.execute("SELECT id FROM projects WHERE id = :id LIMIT 1", { id: projectId });
  if (!rows[0]) {
    const error = new Error("Projeto informado nao existe.");
    error.statusCode = 400;
    throw error;
  }
  return projectId;
}

async function getPublicPosts(req, res) {
  const { q = "", category = "", module = "", version = "", project = "", highlight = "", onlyPublished = "1" } = req.query;

  let sql = `
    SELECT
      p.id,
      p.title,
      p.slug,
      p.summary,
      p.content,
      p.category,
      p.status,
      p.is_featured,
      p.is_pinned,
      p.erp_version,
      p.erp_module,
      p.project_id,
      p.image_url,
      p.published_at,
      p.created_at,
      u.name AS author,
      pr.name AS project_name
    FROM posts p
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN projects pr ON pr.id = p.project_id
    WHERE 1=1
  `;
  const params = {};

  if (onlyPublished !== "0") {
    sql += " AND p.status = 'publicado' ";
  }
  if (q) {
    sql += " AND (p.title LIKE :q OR p.summary LIKE :q OR p.content LIKE :q OR p.erp_module LIKE :q) ";
    params.q = `%${q}%`;
  }
  if (category) {
    sql += " AND p.category = :category ";
    params.category = category;
  }
  if (module) {
    sql += " AND p.erp_module = :module ";
    params.module = module;
  }
  if (version) {
    sql += " AND p.erp_version = :version ";
    params.version = version;
  }
  if (project) {
    sql += " AND p.project_id = :project ";
    params.project = Number(project);
  }
  if (highlight === "1") {
    sql += " AND p.is_featured = 1 ";
  }

  sql += " ORDER BY p.is_pinned DESC, COALESCE(p.published_at, p.created_at) DESC ";

  const [rows] = await pool.execute(sql, params);
  return res.json(rows.map(mapPost));
}

async function getHighlights(req, res) {
  const [rows] = await pool.execute(
    `
    SELECT
      p.id, p.title, p.slug, p.summary, p.category, p.erp_version, p.erp_module,
      p.project_id, pr.name AS project_name, p.image_url, p.published_at, p.created_at, u.name AS author
    FROM posts p
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN projects pr ON pr.id = p.project_id
    WHERE p.status = 'publicado' AND (p.is_featured = 1 OR p.is_pinned = 1)
    ORDER BY p.is_pinned DESC, COALESCE(p.published_at, p.created_at) DESC
    LIMIT 6
  `,
    {}
  );
  return res.json(rows.map(mapPost));
}

async function getPostBySlugOrId(req, res) {
  const { slugOrId } = req.params;
  const byId = Number.isInteger(Number(slugOrId));

  const [rows] = await pool.execute(
    `
    SELECT
      p.*, u.name AS author, pr.name AS project_name
    FROM posts p
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN projects pr ON pr.id = p.project_id
    WHERE ${byId ? "p.id = :value" : "p.slug = :value"}
    LIMIT 1
  `,
    { value: byId ? Number(slugOrId) : slugOrId }
  );

  const post = rows[0];
  if (!post) {
    return res.status(404).json({ message: "Postagem nao encontrada." });
  }

  if (post.status !== "publicado" && (!req.user || req.user.role !== "admin")) {
    return res.status(404).json({ message: "Postagem nao encontrada." });
  }

  return res.json(mapPost(post));
}

async function getMeta(req, res) {
  const [versions] = await pool.execute(
    "SELECT DISTINCT erp_version FROM posts WHERE erp_version IS NOT NULL AND erp_version <> '' ORDER BY erp_version DESC",
    {}
  );
  const [modules] = await pool.execute(
    "SELECT DISTINCT erp_module FROM posts WHERE erp_module IS NOT NULL AND erp_module <> '' ORDER BY erp_module ASC",
    {}
  );
  const [projects] = await pool.execute(
    "SELECT id, name, slug FROM projects WHERE active = 1 ORDER BY sort_order ASC, name ASC",
    {}
  );

  return res.json({
    categories: ERP_CATEGORIES,
    versions: versions.map((row) => row.erp_version),
    modules: modules.map((row) => row.erp_module),
    projects
  });
}

async function getAdminPosts(req, res) {
  const [rows] = await pool.execute(
    `
    SELECT p.*, u.name AS author, pr.name AS project_name
    FROM posts p
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN projects pr ON pr.id = p.project_id
    ORDER BY p.updated_at DESC
  `,
    {}
  );
  return res.json(rows.map(mapPost));
}

async function getAdminProjects(req, res) {
  const [rows] = await pool.execute(
    "SELECT id, name, slug, active, sort_order, created_at FROM projects ORDER BY sort_order ASC, name ASC",
    {}
  );
  return res.json(rows);
}

async function createProject(req, res) {
  const { name } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: "Informe o nome da aba/projeto." });
  }

  const safeName = String(name).trim().slice(0, 80);
  let slug = slugify(safeName).slice(0, 80);
  if (!slug) slug = `projeto-${Date.now()}`;

  const [exists] = await pool.execute("SELECT id FROM projects WHERE slug = :slug LIMIT 1", { slug });
  if (exists[0]) {
    slug = `${slug}-${Date.now()}`;
  }

  const [orderRows] = await pool.execute("SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM projects", {});
  const sort_order = Number(orderRows?.[0]?.max_order || 0) + 1;

  const [result] = await pool.execute(
    "INSERT INTO projects (name, slug, active, sort_order) VALUES (:name, :slug, 1, :sort_order)",
    { name: safeName, slug, sort_order }
  );

  await pool.execute("INSERT INTO change_logs (user_id, action, details) VALUES (:user_id, 'create', :details)", {
    user_id: req.user.id,
    details: `Projeto criado: ${safeName}`
  });

  return res.status(201).json({ id: result.insertId, name: safeName, slug, sort_order });
}

async function createPost(req, res) {
  const {
    title,
    summary = "",
    content = "",
    category,
    status = "rascunho",
    is_featured = 0,
    is_pinned = 0,
    erp_version = "",
    erp_module = "",
    project_id = null
  } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ message: "Titulo, conteudo e categoria sao obrigatorios." });
  }

  const slug = `${slugify(title)}-${Date.now()}`;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const normalizedStatus = normalizeStatus(status);
  const parsedProjectId = await resolveProjectId(project_id);
  const publishedAt = normalizedStatus === "publicado" ? new Date() : null;

  const [result] = await pool.execute(
    `
    INSERT INTO posts (
      title, slug, summary, content, category, status, is_featured, is_pinned,
      erp_version, erp_module, project_id, image_url, author_id, published_at
    ) VALUES (
      :title, :slug, :summary, :content, :category, :status, :is_featured, :is_pinned,
      :erp_version, :erp_module, :project_id, :image_url, :author_id, :published_at
    )
  `,
    {
      title,
      slug,
      summary,
      content,
      category,
      status: normalizedStatus,
      is_featured: Number(is_featured) ? 1 : 0,
      is_pinned: Number(is_pinned) ? 1 : 0,
      erp_version,
      erp_module,
      project_id: parsedProjectId,
      image_url,
      author_id: req.user.id,
      published_at: publishedAt
    }
  );

  await pool.execute(
    "INSERT INTO change_logs (user_id, post_id, action, details) VALUES (:user_id, :post_id, 'create', :details)",
    {
      user_id: req.user.id,
      post_id: result.insertId,
      details: `Post criado: ${title}`
    }
  );

  return res.status(201).json({ id: result.insertId, slug, message: "Postagem criada com sucesso." });
}

async function updatePost(req, res) {
  const { id } = req.params;
  const {
    title,
    summary = "",
    content = "",
    category,
    status = "rascunho",
    is_featured = 0,
    is_pinned = 0,
    erp_version = "",
    erp_module = "",
    project_id = null
  } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ message: "Titulo, conteudo e categoria sao obrigatorios." });
  }

  const [existingRows] = await pool.execute("SELECT id, published_at FROM posts WHERE id = :id LIMIT 1", { id: Number(id) });
  if (!existingRows[0]) {
    return res.status(404).json({ message: "Postagem nao encontrada." });
  }

  const imageUpdate = req.file ? ", image_url = :image_url" : "";
  const normalizedStatus = normalizeStatus(status);
  const parsedProjectId = await resolveProjectId(project_id);
  const currentPublishedAt = existingRows[0].published_at || null;
  const nextPublishedAt = normalizedStatus === "publicado" ? currentPublishedAt || new Date() : null;

  await pool.execute(
    `
    UPDATE posts
    SET
      title = :title,
      summary = :summary,
      content = :content,
      category = :category,
      status = :status,
      is_featured = :is_featured,
      is_pinned = :is_pinned,
      erp_version = :erp_version,
      erp_module = :erp_module,
      project_id = :project_id,
      slug = :slug,
      published_at = :published_at
      ${imageUpdate}
    WHERE id = :id
  `,
    {
      id: Number(id),
      title,
      summary,
      content,
      category,
      status: normalizedStatus,
      is_featured: Number(is_featured) ? 1 : 0,
      is_pinned: Number(is_pinned) ? 1 : 0,
      erp_version,
      erp_module,
      project_id: parsedProjectId,
      slug: `${slugify(title)}-${id}`,
      published_at: nextPublishedAt,
      image_url: req.file ? `/uploads/${req.file.filename}` : undefined
    }
  );

  await pool.execute(
    "INSERT INTO change_logs (user_id, post_id, action, details) VALUES (:user_id, :post_id, 'update', :details)",
    {
      user_id: req.user.id,
      post_id: Number(id),
      details: `Post atualizado: ${title}`
    }
  );

  return res.json({ message: "Postagem atualizada com sucesso." });
}

async function deletePost(req, res) {
  const { id } = req.params;

  const [rows] = await pool.execute("SELECT id, title FROM posts WHERE id = :id LIMIT 1", { id: Number(id) });
  const post = rows[0];
  if (!post) {
    return res.status(404).json({ message: "Postagem nao encontrada." });
  }

  await pool.execute("DELETE FROM posts WHERE id = :id", { id: Number(id) });

  await pool.execute(
    "INSERT INTO change_logs (user_id, post_id, action, details) VALUES (:user_id, :post_id, 'delete', :details)",
    {
      user_id: req.user.id,
      post_id: Number(id),
      details: `Post removido: ${post.title}`
    }
  );

  return res.json({ message: "Postagem excluida com sucesso." });
}

async function getAdminLogs(req, res) {
  const [rows] = await pool.execute(
    `
    SELECT
      l.id,
      l.action,
      l.details,
      l.created_at,
      u.name AS user_name,
      p.title AS post_title
    FROM change_logs l
    LEFT JOIN users u ON u.id = l.user_id
    LEFT JOIN posts p ON p.id = l.post_id
    ORDER BY l.created_at DESC
    LIMIT 50
  `,
    {}
  );
  return res.json(rows);
}

module.exports = {
  getPublicPosts,
  getHighlights,
  getPostBySlugOrId,
  getMeta,
  getAdminPosts,
  getAdminProjects,
  createProject,
  createPost,
  updatePost,
  deletePost,
  getAdminLogs
};
