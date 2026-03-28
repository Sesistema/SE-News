const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const defaultEnvFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
const resolvedEnvPath = path.resolve(process.cwd(), defaultEnvFile);
require("dotenv").config({ path: fs.existsSync(resolvedEnvPath) ? resolvedEnvPath : path.resolve(process.cwd(), ".env") });

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const port = Number(process.env.PORT || 4000);
const serveFrontend = ["1", "true", "yes"].includes(String(process.env.SERVE_FRONTEND || "").toLowerCase());
const frontendDistDir = path.resolve(process.cwd(), process.env.FRONTEND_DIST_DIR || "../frontend/dist");
const frontendDistExists = fs.existsSync(frontendDistDir);
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origem nao permitida no CORS."));
    }
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (_, res) => {
  res.json({ status: "ok", app: "SeNews API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);

if (serveFrontend && frontendDistExists) {
  app.use(express.static(frontendDistDir));
  app.get(/^\/(?!api|uploads).*/, (_, res) => {
    res.sendFile(path.join(frontendDistDir, "index.html"));
  });
}

app.use((err, req, res, next) => {
  if (err?.statusCode) {
    return res.status(err.statusCode).json({ message: err.message || "Erro na requisicao." });
  }
  if (err?.message?.includes("Formato de imagem")) {
    return res.status(400).json({ message: err.message });
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "A imagem deve ter no maximo 5MB." });
  }
  console.error(err);
  const response = { message: "Erro interno do servidor." };
  if (process.env.NODE_ENV !== "production") {
    response.details = err?.sqlMessage || err?.message || String(err);
    if (err?.code) response.code = err.code;
  }
  return res.status(500).json(response);
});

app.use((req, res) => {
  if (serveFrontend && fs.existsSync(frontendDistDir) && !req.path.startsWith("/api")) {
    return res.sendFile(path.join(frontendDistDir, "index.html"));
  }
  return res.status(404).json({ message: "Rota nao encontrada." });
});

app.listen(port, () => {
  console.log(`SeNews API executando na porta ${port}`);
  console.log(`CWD: ${process.cwd()}`);
  console.log(`SERVE_FRONTEND: ${serveFrontend}`);
  console.log(`FRONTEND_DIST_DIR (resolvido): ${frontendDistDir}`);
  console.log(`Frontend dist existe: ${frontendDistExists}`);
  if (serveFrontend && frontendDistExists) {
    console.log(`Modo fullstack ativo. Frontend em: ${frontendDistDir}`);
  } else if (serveFrontend && !frontendDistExists) {
    console.log("Aviso: SERVE_FRONTEND=true, mas o dist nao foi encontrado no caminho configurado.");
  }
});
