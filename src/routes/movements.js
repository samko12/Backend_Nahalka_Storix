const express = require('express');
const router = express.Router();
const { validateBody, validateQuery } = require('../middleware/validate');
const { createMovementSchema, updateMovementSchema, listMovementsSchema } = require('../schemas/movement.schema');
const movementsController = require('../controllers/movementsController');

// GET /api/movements — zoznam pohybov
router.get('/', validateQuery(listMovementsSchema), movementsController.list);

// POST /api/movements — vytvorí pohyb
router.post('/', validateBody(createMovementSchema), movementsController.create);

// GET /api/movements/:id — jeden pohyb
router.get('/:id', movementsController.getOne);

// PUT /api/movements/:id — uprav note pohybu
router.put('/:id', validateBody(updateMovementSchema), movementsController.update);

// DELETE /api/movements/:id — zmaž pohyb a vráť zásoby
router.delete('/:id', movementsController.remove);

module.exports = router;
