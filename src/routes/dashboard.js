const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard — súhrnné štatistiky skladu
router.get('/', dashboardController.getSummary);

module.exports = router;
