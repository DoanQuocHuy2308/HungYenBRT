const express = require('express');
const router = express.Router();
const discountFieldController = require('../controllers/discountFieldController');

// Lấy các field cần thiết theo loại giảm giá
router.get('/type/:id_Discount_Type', discountFieldController.getFieldsByDiscountType);

// Thêm, sửa, xóa field chung
router.post('/', discountFieldController.createField);
router.put('/:id', discountFieldController.updateField);
router.delete('/:id', discountFieldController.deleteField);

module.exports = router;
