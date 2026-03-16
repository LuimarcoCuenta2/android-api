// barrios.js

const express = require('express');

module.exports = (db) => {

  const router = express.Router();

  /* =========================
     GET /barrios/:municipioId
  ========================= */
  router.get('/:municipioId', (req, res) => {

    const { municipioId } = req.params;

    db.query(
      'SELECT id, nombre FROM barrios WHERE municipio_id = ? ORDER BY nombre ASC',
      [municipioId],
      (err, result) => {

        if (err) {
          console.error('❌ Error barrios:', err.message);
          return res.status(500).json({ error: err.message });
        }

        res.json(result);
      }
    );

  });

  return router;
};
