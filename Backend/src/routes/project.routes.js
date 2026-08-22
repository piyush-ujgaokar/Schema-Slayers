const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, projectController.saveProject);
router.get('/', authMiddleware, projectController.getProjects);
router.delete('/:id', authMiddleware, projectController.deleteProject);

module.exports = router;
