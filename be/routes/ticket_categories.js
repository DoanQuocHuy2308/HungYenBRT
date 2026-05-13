const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ticketCategoryController');

router.get('/stats',   ctrl.getStats);
router.get('/',        ctrl.getAll);
router.get('/:id',     ctrl.getById);
router.post('/',       ctrl.create);
router.post('/reorder', ctrl.reorder);
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.delete);

module.exports = router;
