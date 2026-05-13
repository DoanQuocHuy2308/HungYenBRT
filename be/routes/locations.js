const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// CRUD cơ bản
router.get('/',          locationController.getAll);
router.get('/stats',     locationController.getStats);
router.get('/:id',       locationController.getById);
router.post('/',         locationController.create);
router.put('/:id',       locationController.update);
router.delete('/:id',    locationController.delete);

// Cập nhật tọa độ GPS riêng
router.patch('/:id/coordinates', locationController.updateCoordinates);

// Sắp xếp thứ tự
router.post('/order/swap',    locationController.swapOrder);
router.post('/order/reorder', locationController.reorder);

module.exports = router;
