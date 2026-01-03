const express = require('express');
const router = express.Router();
const { login, createAdmin } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);

router.post('/create-admin', authenticateToken, createAdmin);

module.exports = router;
