const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// ── Admin ───────────────────────────────────────────────────────────────────
router.get('/admin/stats', ticketController.dashboard);
router.get('/admin/full-stats', ticketController.fullStats);
router.get('/admin/all', ticketController.adminGetAll);

// Quản lý trạng thái Đơn hàng (Order)
router.patch('/order/:id/status', ticketController.updateOrderStatus);
router.delete('/order/:id', ticketController.deleteOrder);

// Quản lý trạng thái Vé lẻ (Ticket Item)
router.patch('/item/:id/status', ticketController.updateTicketStatus);

// ── User / General ──────────────────────────────────────────────────────────
router.post('/purchase-time', ticketController.purchaseTimeTicket);
router.post('/purchase', ticketController.purchase);
router.get('/my/:id_User', ticketController.getMyOrders);
router.get('/detail/:id', ticketController.getDetail);

// ── Staff ───────────────────────────────────────────────────────────────────
router.get('/staff-stats/:id', ticketController.staffStats);

module.exports = router;
