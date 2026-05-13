const express = require('express');
const router = express.Router();
const discountTypeController = require('../controllers/discountTypeController');

router.get('/', discountTypeController.getAll);
router.get('/:id', discountTypeController.getById);
router.post('/', discountTypeController.create);
router.put('/:id', discountTypeController.update);
router.delete('/:id', discountTypeController.delete);

module.exports = router;
