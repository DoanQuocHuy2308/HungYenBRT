const express = require('express');
const router = express.Router();
const ticketPriceController = require('../controllers/ticketPriceController');

router.get('/stats',               ticketPriceController.getStats);
router.get('/types',               ticketPriceController.getTypes);
router.get('/',                    ticketPriceController.getAll);
router.get('/:id',                 ticketPriceController.getById);
router.post('/',                   ticketPriceController.create);
router.post('/bulk-upsert',        ticketPriceController.bulkUpsert);
router.put('/:id',                 ticketPriceController.update);
router.delete('/:id',              ticketPriceController.delete);

module.exports = router;
