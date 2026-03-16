// paises.js

const express = require('express');

module.exports = (db) => {

  const router = express.Router();

  /* =========================
     GET /paises
  ========================= */
  router.get('/', (req, res) => {

    db.query(
      'SELECT id, nombre FROM paises ORDER BY nombre ASC',
      (err, result) => {

        if (err) {
          console.error('❌ Error al consultar paises:', err.message);
          return res.status(500).json({ error: err.message });
        }

        res.json(result);
      }
    );

  });

  return router;
};
