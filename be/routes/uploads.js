const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const UploadController = require('../controllers/uploadController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = function (req, file, cb) {
    // Chấp nhận tất cả loại ảnh bất kể HEIC, PNG, WEBP từ Camera điện thoại
    const mimetype = file.mimetype.startsWith('image/');
    if (mimetype) {
        return cb(null, true);
    }
    cb(new Error('Chỉ cho phép upload file ảnh!'));
};

const tempStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'temp_uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'temp-' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, 
    fileFilter: fileFilter
});

const tempUpload = multer({
    storage: tempStorage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: fileFilter
});

router.post('/cccd-qr', tempUpload.array('cccd_images', 2), UploadController.scanCCCD);
router.post('/promotion-banner', upload.single('banner'), UploadController.uploadPromotionBanner);

module.exports = router;
