// departamentos.js

const express = require('express');

module.exports = (db) => {

  const router = express.Router();

  router.get('/:paisId', (req, res) => {

    const { paisId } = req.params;

    db.query(
      'SELECT id, nombre FROM departamentos WHERE pais_id = ? ORDER BY nombre ASC',
      [paisId],
      (err, result) => {

        if (err) {
          console.error('❌ Error departamentos:', err.message);
          return res.status(500).json({ error: err.message });
        }

        res.json(result);
      }
    );

  });

  return router;
};
