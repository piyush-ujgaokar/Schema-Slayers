const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, aiController.processPrompt);

module.exports = router;
