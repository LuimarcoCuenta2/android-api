// integrantes.js

const express = require('express');
const router = express.Router();

// Exportamos una función que recibe la conexión 'db' y devuelve el router listo
module.exports = (db) => {
  router.get('/', (req, res) => {
    db.query('SELECT * FROM integrantes', (err, results) => {
      if (err) {
        console.error('❌ Error al obtener integrantes:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });

  router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM integrantes WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(results[0]);
    });
  });

  router.post('/', (req, res) => {
    const data = req.body;
    if (!data.numero_documento || !data.nombres) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    db.query('INSERT INTO integrantes SET ?', data, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...data });
    });
  });

  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    db.query('UPDATE integrantes SET ? WHERE id = ?', [data, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, ...data });
    });
  });

  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM integrantes WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Integrante eliminado' });
    });
  });

  return router;
};
