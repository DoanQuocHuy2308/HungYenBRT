const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) return cb(null, true);
        cb(new Error('Chỉ cho phép upload ảnh!'));
    }
});
const uploadFields = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cccd_front', maxCount: 1 },
    { name: 'cccd_back', maxCount: 1 }
]);

// Stats (đặt trước /:id để tránh conflict)
router.get('/stats', EmployeeController.getStats);

// CRUD cơ bản
router.get('/', EmployeeController.getAllEmployees);
router.get('/:id', EmployeeController.getEmployeeById);
router.post('/', uploadFields, EmployeeController.createEmployee);
router.put('/:id', uploadFields, EmployeeController.updateEmployee);
router.delete('/:id', EmployeeController.deleteEmployee);

// Chức năng nâng cao
router.patch('/:id/role', EmployeeController.changeRole);          // Cấp / thay đổi quyền
router.patch('/:id/toggle-lock', EmployeeController.toggleLock);  // Khóa / Mở khóa
router.patch('/:id/reset-password', EmployeeController.resetPassword); // Đặt lại mật khẩu (Admin)
router.patch('/:id/change-password', EmployeeController.changePassword); // Đổi mật khẩu (Cá nhân)

module.exports = router;
