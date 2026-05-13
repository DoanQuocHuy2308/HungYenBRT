const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ticketTypeController');

router.get('/stats',           ctrl.getStats);
router.get('/categories',      ctrl.getCategories);
router.get('/discount-types',  ctrl.getDiscountTypes);
router.get('/',                ctrl.getAll);
router.get('/:id',             ctrl.getById);
router.post('/',               ctrl.create);
router.put('/:id',             ctrl.update);
router.delete('/:id',          ctrl.delete);

module.exports = router;
