// Conexion a MySQL (Amazon RDS) - TechFest Soluciones (Forma B)
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Crea la tabla de expositores si no existe.
async function initDb() {
  const sql = `
    CREATE TABLE IF NOT EXISTS expositores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre_empresa VARCHAR(120) NOT NULL,
      rubro VARCHAR(60) NOT NULL,
      costo_stand DECIMAL(10,2) NOT NULL,
      cupos_asignados INT NOT NULL DEFAULT 0,
      contacto VARCHAR(120),
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const conn = await pool.getConnection();
  try {
    await conn.query(sql);
    console.log('Tabla "expositores" verificada/creada correctamente.');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDb };
