const express = require('express');
const router = express.Router();
const { validateBody, validateQuery } = require('../middleware/validate');
const { createProductSchema, updateProductSchema, listProductsSchema } = require('../schemas/product.schema');
const productsController = require('../controllers/productsController');

// GET /api/products — vráti zoznam produktov
router.get('/', validateQuery(listProductsSchema), productsController.list);

// GET /api/products/:id — vráti jeden produkt
router.get('/:id', productsController.getOne);

// PUT /api/products/:id — aktualizuje produkt
router.put('/:id', validateBody(updateProductSchema), productsController.update);

// DELETE /api/products/:id — zmaže produkt
router.delete('/:id', productsController.remove);

// POST /api/products — vytvorí nový produkt
router.post('/', validateBody(createProductSchema), productsController.create);

module.exports = router;
