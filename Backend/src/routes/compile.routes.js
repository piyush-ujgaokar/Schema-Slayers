const express = require('express');
const router = express.Router();
const compileController = require('../controllers/compile.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, compileController.compileCode);

module.exports = router;
