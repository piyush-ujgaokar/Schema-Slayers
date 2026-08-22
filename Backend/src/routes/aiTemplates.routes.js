const express = require('express');
const router = express.Router();
const aiTemplatesController = require('../controllers/aiTemplates.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect route to ensure authenticated users query the template service
router.post('/', authMiddleware, aiTemplatesController.generateTemplates);

module.exports = router;
