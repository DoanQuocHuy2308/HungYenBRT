const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

router.get('/stats', promotionController.getStats);
router.get('/', promotionController.getAll);
router.get('/:code', promotionController.getByCode);
router.post('/', promotionController.create);
router.put('/:code', promotionController.update);
router.delete('/:code', promotionController.delete);

module.exports = router;
