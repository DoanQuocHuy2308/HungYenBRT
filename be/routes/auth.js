const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB cho ảnh điện thoại Full Res
    fileFilter: function (req, file, cb) {
        // Chấp nhận mọi file ảnh từ điện thoại (HEIC, PNG, JPG, WEBP, ...)
        if (file.mimetype.startsWith('image/')) {
            return cb(null, true);
        }
        cb(new Error('Chỉ cho phép upload file ảnh!'));
    }
});

const uploadFields = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cccd_front', maxCount: 1 },
    { name: 'cccd_back', maxCount: 1 }
]);

router.post('/login-employee', AuthController.loginEmployee);
router.post('/login-customer', AuthController.loginCustomer);
router.post('/logout', AuthController.logout);
router.post('/register-customer', uploadFields, AuthController.registerCustomer);
router.post('/register-proxy', uploadFields, AuthController.registerProxy);
router.post('/register-employee', uploadFields, AuthController.registerEmployee);

module.exports = router;
