const express = require('express');
const router = express.Router();
const ticketLogController = require('../controllers/ticketLogController');

// Admin: xem toàn bộ log (filter: ?location_id=x&status=y&scan_direction=z&date_from=&date_to=&page=1&limit=50)
router.get('/admin/all', ticketLogController.adminGetAll);

// Admin: thống kê tổng hợp
router.get('/admin/stats', ticketLogController.adminGetStats);

// User/Admin: xem lịch sử chuyến của 1 vé
router.get('/ticket/:ticketId', ticketLogController.getByTicket);

module.exports = router;
