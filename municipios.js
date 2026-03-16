const express = require('express');

module.exports = (db) => {

  const router = express.Router();

  router.get('/:departamentoId', (req, res) => {

    const { departamentoId } = req.params;

    db.query(
      'SELECT id, nombre FROM municipios WHERE departamento_id = ? ORDER BY nombre ASC',
      [departamentoId],
      (err, result) => {

        if (err) {
          console.error('❌ Error municipios:', err.message);
          return res.status(500).json({ error: err.message });
        }

        res.json(result);
      }
    );

  });

  return router;
};
