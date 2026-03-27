function stripHtml(content) {
  return String(content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

module.exports = { stripHtml };
