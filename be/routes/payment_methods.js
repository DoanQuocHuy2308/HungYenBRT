const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');

router.get('/', paymentMethodController.getAll);
router.get('/:id', paymentMethodController.getById);
router.post('/', paymentMethodController.create);
router.put('/:id', paymentMethodController.update);
router.delete('/:id', paymentMethodController.delete);

module.exports = router;
