const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ticketTypeLocationController');

router.get('/types',              ctrl.getAllTypes);
router.get('/locations',          ctrl.getAllLocations);
router.post('/calculate-range',   ctrl.calculateRange);
router.get('/:typeId/allowed',    ctrl.getAllowedLocations);
router.get('/:typeId',            ctrl.getTypeConfig);
router.post('/:typeId/save-trip', ctrl.saveTripConfig);

module.exports = router;
