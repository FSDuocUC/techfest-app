// API REST - CRUD de expositores
// TechFest Soluciones (Forma B) - Sumativa 5 - Introduccion al Cloud Computing (CDY2201)

const express = require('express');
const cors = require('cors');
const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Salud: verifica conexion con RDS
app.get('/api/health', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    res.json({ status: 'ok', db: 'conectada a RDS' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'No hay conexion con RDS', detalle: err.message });
  }
});

// LISTAR (READ)
app.get('/api/expositores', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM expositores ORDER BY id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CONSULTAR UNO (READ)
app.get('/api/expositores/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM expositores WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Expositor no encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AGREGAR (CREATE)
app.post('/api/expositores', async (req, res) => {
  const { nombre_empresa, rubro, costo_stand, cupos_asignados, contacto } = req.body;
  if (!nombre_empresa || !rubro || costo_stand == null) {
    return res.status(400).json({ error: 'nombre_empresa, rubro y costo_stand son obligatorios' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO expositores (nombre_empresa, rubro, costo_stand, cupos_asignados, contacto) VALUES (?, ?, ?, ?, ?)',
      [nombre_empresa, rubro, costo_stand, cupos_asignados || 0, contacto || null]
    );
    res.status(201).json({ id: result.insertId, nombre_empresa, rubro, costo_stand, cupos_asignados: cupos_asignados || 0, contacto });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ACTUALIZAR (UPDATE)
app.put('/api/expositores/:id', async (req, res) => {
  const { nombre_empresa, rubro, costo_stand, cupos_asignados, contacto } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE expositores SET nombre_empresa = ?, rubro = ?, costo_stand = ?, cupos_asignados = ?, contacto = ? WHERE id = ?',
      [nombre_empresa, rubro, costo_stand, cupos_asignados, contacto || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Expositor no encontrado' });
    res.json({ id: Number(req.params.id), nombre_empresa, rubro, costo_stand, cupos_asignados, contacto });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ELIMINAR (DELETE)
app.delete('/api/expositores/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM expositores WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Expositor no encontrado' });
    res.json({ mensaje: 'Expositor eliminado', id: Number(req.params.id) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => console.log(`API TechFest (expositores) escuchando en el puerto ${PORT}`));
  } catch (err) {
    console.error('Error al iniciar el servidor:', err.message);
    process.exit(1);
  }
}
start();
