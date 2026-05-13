const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

router.get('/my-vouchers/:userId', voucherController.getMyVouchers);
router.get('/validate/:code', voucherController.validateVoucher);
router.post('/admin/resync-codes', voucherController.resyncCodes);

module.exports = router;
