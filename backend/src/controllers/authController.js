const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Informe e-mail e senha." });
  }

  const [rows] = await pool.execute(
    "SELECT id, name, email, password_hash, role, active FROM users WHERE email = :email LIMIT 1",
    { email }
  );

  const user = rows[0];
  if (!user || !user.active) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Somente administradores podem acessar esta área." });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}

module.exports = { login };
