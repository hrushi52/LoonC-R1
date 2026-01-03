const express = require('express');
const router = express.Router();
const {
  listProperties,
  listPublicProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleStatus
} = require('../controllers/properties.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/public-list', listPublicProperties);

router.get('/list', authenticateToken, listProperties);

router.get('/:id', authenticateToken, getPropertyById);

router.post('/create', authenticateToken, createProperty);

router.put('/update/:id', authenticateToken, updateProperty);

router.delete('/delete/:id', authenticateToken, deleteProperty);

router.patch('/toggle-status/:id', authenticateToken, toggleStatus);

module.exports = router;
