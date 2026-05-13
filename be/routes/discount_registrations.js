const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const discountRegistrationController = require('../controllers/discountRegistrationController');
const discountConfigController = require('../controllers/discountConfigController');

// Cấu hình Multer để lưu tạm file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// User thao tác
router.post('/apply', upload.any(), discountRegistrationController.apply);
router.get('/my-applications/:id_User', discountRegistrationController.getMyApplications);

// Admin thao tác
router.get('/admin/all', discountRegistrationController.getAll);
router.get('/admin/pending', discountRegistrationController.getPending);
router.get('/admin/:id', discountRegistrationController.getById);
router.put('/admin/:id/status', discountRegistrationController.updateStatus);
router.delete('/admin/:id', discountRegistrationController.delete);

// Admin: Cấu hình chính sách & Fields (Form Builder)
router.get('/admin/config/all', discountConfigController.getFullConfig);
router.post('/admin/config/type', discountConfigController.saveType);
router.delete('/admin/config/type/:id', discountConfigController.deleteType);
router.post('/admin/config/sync-fields', discountConfigController.syncFields);

module.exports = router;
