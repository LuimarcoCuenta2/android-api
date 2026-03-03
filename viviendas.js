// viviendas.js

const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

/* =========================
   POOL DE CONEXIONES MYSQL
========================= */
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'luimi2025',
  database: 'miapp_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* =========================
   VALIDAR JERARQUÍA UBICACIÓN
========================= */
async function validarUbicacion(data) {
  const {
    id_pais,
    id_departamento,
    id_municipio,
    id_barrio,
    id_usuario
  } = data;

  const query = `
    SELECT 1
    FROM paises p
    JOIN departamentos d ON d.id = ? AND d.pais_id = p.id
    JOIN municipios m ON m.id = ? AND m.departamento_id = d.id
    JOIN barrios b ON b.id = ? AND b.municipio_id = m.id
    JOIN usuarios u ON u.id = ?
    WHERE p.id = ?
  `;

  const [rows] = await pool.execute(query, [
    id_departamento,
    id_municipio,
    id_barrio,
    id_usuario,
    id_pais
  ]);

  return rows.length > 0;
}

/* =========================
   GET /viviendas (CON JOIN)
========================= */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.*,
        b.nombre AS barrio,
        m.nombre AS municipio,
        d.nombre AS departamento,
        p.nombre AS pais
      FROM viviendas v
      LEFT JOIN barrios b ON v.id_barrio = b.id
      LEFT JOIN municipios m ON v.id_municipio = m.id
      LEFT JOIN departamentos d ON v.id_departamento = d.id
      LEFT JOIN paises p ON v.id_pais = p.id
    `;

    const [rows] = await pool.execute(query);
    res.json(rows);

  } catch (error) {
    console.error('❌ Error al consultar viviendas:', error.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

/* =========================
   GET /viviendas/:id
========================= */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        v.*,
        b.nombre AS barrio,
        m.nombre AS municipio,
        d.nombre AS departamento,
        p.nombre AS pais
      FROM viviendas v
      LEFT JOIN barrios b ON v.id_barrio = b.id
      LEFT JOIN municipios m ON v.id_municipio = m.id
      LEFT JOIN departamentos d ON v.id_departamento = d.id
      LEFT JOIN paises p ON v.id_pais = p.id
      WHERE v.id = ?
    `;

    const [rows] = await pool.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vivienda no encontrada' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('❌ Error al consultar vivienda:', error.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

/* =========================
   POST /viviendas
========================= */
router.post('/', async (req, res) => {

  const connection = await pool.getConnection();

  try {
    const {
      id_pais,
      id_departamento,
      id_municipio,
      corregimiento,
      vereda,
      localidad,
      id_barrio,
      direccion_vivienda,
      carrera,
      sector,
      calle,
      manzana,
      lote,
      punto_referencia,
      conjunto,
      urbanizacion,
      latitude,
      longitude,
      w3w,
      id_usuario
    } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ error: 'id_usuario es obligatorio' });
    }

    const ubicacionValida = await validarUbicacion(req.body);

    if (!ubicacionValida) {
      return res.status(400).json({
        error: 'La jerarquía de ubicación no es válida'
      });
    }

    await connection.beginTransaction();

    const insertQuery = `
      INSERT INTO viviendas (
        id_pais,
        id_departamento,
        id_municipio,
        corregimiento,
        vereda,
        localidad,
        id_barrio,
        direccion_vivienda,
        carrera,
        sector,
        calle,
        manzana,
        lote,
        punto_referencia,
        conjunto,
        urbanizacion,
        latitude,
        longitude,
        w3w,
        id_usuario
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(insertQuery, [
      id_pais ?? null,
      id_departamento ?? null,
      id_municipio ?? null,
      corregimiento ?? null,
      vereda ?? null,
      localidad ?? null,
      id_barrio ?? null,
      direccion_vivienda ?? null,
      carrera ?? null,
      sector ?? null,
      calle ?? null,
      manzana ?? null,
      lote ?? null,
      punto_referencia ?? null,
      conjunto ?? null,
      urbanizacion ?? null,
      latitude ?? null,
      longitude ?? null,
      w3w ?? null,
      id_usuario
    ]);

    const nuevoId = result.insertId;
    const codigoGenerado = `VIV-${String(nuevoId).padStart(5, '0')}`;

    await connection.execute(
      'UPDATE viviendas SET codigo = ? WHERE id = ?',
      [codigoGenerado, nuevoId]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: 'Vivienda creada',
      id: nuevoId,
      codigo: codigoGenerado
    });

  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: 'Alguno de los IDs enviados no existe'
      });
    }

    console.error('❌ Error al insertar vivienda:', error.message);
    res.status(500).json({ error: 'Error del servidor' });

  } finally {
    connection.release();
  }
});

/* =========================
   PUT /viviendas/:id
========================= */
router.put('/:id', async (req, res) => {

  try {
    const { id } = req.params;

    if (!req.body.id_usuario) {
      return res.status(400).json({ error: 'id_usuario es obligatorio' });
    }

    const ubicacionValida = await validarUbicacion(req.body);

    if (!ubicacionValida) {
      return res.status(400).json({
        error: 'La jerarquía de ubicación no es válida'
      });
    }

    const query = `
      UPDATE viviendas SET
        id_pais = ?,
        id_departamento = ?,
        id_municipio = ?,
        corregimiento = ?,
        vereda = ?,
        localidad = ?,
        id_barrio = ?,
        direccion_vivienda = ?,
        carrera = ?,
        sector = ?,
        calle = ?,
        manzana = ?,
        lote = ?,
        punto_referencia = ?,
        conjunto = ?,
        urbanizacion = ?,
        latitude = ?,
        longitude = ?,
        w3w = ?,
        vivienda_localizada = ?,
        id_usuario = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [
      req.body.id_pais ?? null,
      req.body.id_departamento ?? null,
      req.body.id_municipio ?? null,
      req.body.corregimiento ?? null,
      req.body.vereda ?? null,
      req.body.localidad ?? null,
      req.body.id_barrio ?? null,
      req.body.direccion_vivienda ?? null,
      req.body.carrera ?? null,
      req.body.sector ?? null,
      req.body.calle ?? null,
      req.body.manzana ?? null,
      req.body.lote ?? null,
      req.body.punto_referencia ?? null,
      req.body.conjunto ?? null,
      req.body.urbanizacion ?? null,
      req.body.latitude ?? null,
      req.body.longitude ?? null,
      req.body.w3w ?? null,
      req.body.vivienda_localizada ?? 0,
      req.body.id_usuario,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vivienda no encontrada' });
    }

    res.json({ mensaje: 'Vivienda actualizada' });

  } catch (error) {

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: 'Alguno de los IDs enviados no existe'
      });
    }

    console.error('❌ Error al actualizar vivienda:', error.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

/* =========================
   DELETE /viviendas/:id
========================= */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM viviendas WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vivienda no encontrada' });
    }

    res.json({ mensaje: 'Vivienda eliminada' });

  } catch (error) {
    console.error('❌ Error al eliminar vivienda:', error.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
