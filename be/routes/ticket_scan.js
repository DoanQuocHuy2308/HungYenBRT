const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ticketScanController = require('../controllers/ticketScanController');

// Cấu hình Multer cho ảnh khuôn mặt
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'face-' + unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET /ticket-scan/qr/:ticketId
// Trả về token QR hiện tại. Frontend gọi mỗi 5 giây để làm mới mã.
router.get('/qr/:ticketId', ticketScanController.generateQr);

// POST /ticket-scan/scan
// Body (form-data): qrToken, locationId, và tùy chọn face_image (File) cho vé thời gian
router.post('/scan', upload.single('face_image'), ticketScanController.scan);

// POST /ticket-scan/lookup
// Body (json): qrToken
router.post('/lookup', express.json(), ticketScanController.lookup);

// GET /ticket-scan/all
// Get all tickets mapped properly for lookup
router.get('/all', ticketScanController.getAll);

// POST /ticket-scan/restock
// Bổ sung vé (phụ phí, đổi ga đến)
router.post('/restock', express.json(), ticketScanController.restock);

module.exports = router;
