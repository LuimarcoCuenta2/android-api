// ==============================
// index.js
// ==============================

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// 1️⃣ Crear la app principal
const app = express();
app.use(cors());
app.use(express.json());

// ==============================
// 2️⃣ Conectar a la base de datos
// ==============================

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'luimi2025',
  database: 'miapp_db'
});

db.connect(err => {
  if (err) {
    console.error('❌ No se pudo conectar a MySQL:', err.message);
    process.exit(1);
  }
  console.log('✔️ Conectado a MySQL');
});

// ==============================
// 3️⃣ Ruta básica
// ==============================

app.get('/', (req, res) => {
  res.send('🚀 API funcionando correctamente');
});

// ==============================
// 4️⃣ Usuarios
// ==============================

app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, result) => {
    if (err) {
      console.error('❌ Error al consultar usuarios:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.post('/usuarios', (req, res) => {
  const { nombre, correo, clave } = req.body;

  if (!nombre || !correo || !clave) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const query = `
    INSERT INTO usuarios (nombre, correo, clave)
    VALUES (?, ?, ?)
  `;

  db.query(query, [nombre, correo, clave], (err, result) => {
    if (err) {
      console.error('❌ Error al insertar usuario:', err.message);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      id: result.insertId
    });
  });
});

// ==============================
// 5️⃣ Routers externos
// ==============================

// Viviendas (si usa router directo)
const viviendasRouter = require('./viviendas');
app.use('/viviendas', viviendasRouter);

// Integrantes
const integrantesRouter = require('./integrantes')(db);
app.use('/integrantes', integrantesRouter);

// Ubicación
const paisesRouter = require('./paises')(db);
const departamentosRouter = require('./departamentos')(db);
const municipiosRouter = require('./municipios')(db);
const barriosRouter = require('./barrios')(db);


app.use('/paises', paisesRouter);

app.use('/departamentos', departamentosRouter);
app.use('/municipios', municipiosRouter);
app.use('/barrios', barriosRouter);

// ==============================
// 6️⃣ Iniciar servidor
// ==============================

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});
