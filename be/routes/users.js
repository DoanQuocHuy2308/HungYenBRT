const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Stats (đặt trước /:id để tránh conflict)
router.get('/stats', UserController.getStats);
router.get('/customers', UserController.getAllCustomers); // Chỉ lấy khách hàng
router.get('/by-cccd/:cccd', UserController.getUserByCCCD);

// CRUD cơ bản
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.put('/profile/:id', upload.single('avatar'), UserController.updateProfile); // Chức năng cập nhật profile của khách
router.delete('/:id', UserController.deleteUser);

// Chức năng nâng cao
router.patch('/:id/toggle-lock', UserController.toggleLock); // Khóa / Mở khóa tài khoản

module.exports = router;
