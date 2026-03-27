require("dotenv").config();
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

async function run() {
  const name = process.argv[2] || "Administrador";
  const email = process.argv[3] || "admin@empresa.com";
  const password = process.argv[4] || "Admin@123";

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const hash = await bcrypt.hash(password, 10);

  await conn.execute(
    `
    INSERT INTO users (name, email, password_hash, role, active)
    VALUES (?, ?, ?, 'admin', 1)
    ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin', active = 1
  `,
    [name, email, hash]
  );

  await conn.end();
  console.log(`Admin criado/atualizado: ${email}`);
  console.log(`Senha: ${password}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
