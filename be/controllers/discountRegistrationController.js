const DiscountRegistrationService = require('../services/discountRegistrationService');

class DiscountRegistrationController {

    // Admin: Lấy tất cả hồ sơ kèm bộ lọc
    async getAll(req, res) {
        try {
            const { status, search } = req.query;
            const data = await DiscountRegistrationService.getAllRegistrations({ status, search });
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách hồ sơ' });
        }
    }

    // Admin: Xem chi tiết hồ sơ
    async getById(req, res) {
        try {
            const data = await DiscountRegistrationService.getRegistrationById(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // User nộp đơn xin duyệt giảm giá
    async apply(req, res) {
        try {
            const { id_User, id_Discount_Type } = req.body;
            if (!id_User || !id_Discount_Type) {
                return res.status(400).json({ success: false, message: 'Thiếu id_User hoặc id_Discount_Type' });
            }

            const fieldValues = [];
            Object.keys(req.body).forEach(key => {
                if (key.startsWith('text_field_')) {
                    const fieldId = key.replace('text_field_', '');
                    fieldValues.push({
                        id_Discount_Field: parseInt(fieldId),
                        field_Value: req.body[key]
                    });
                }
            });

            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    if (file.fieldname.startsWith('file_field_')) {
                        const fieldId = file.fieldname.replace('file_field_', '');
                        fieldValues.push({
                            id_Discount_Field: parseInt(fieldId),
                            field_Value: `/uploads/${file.filename}`
                        });
                    }
                });
            }

            const data = await DiscountRegistrationService.applyForDiscount(id_User, id_Discount_Type, fieldValues);
            res.status(201).json({ success: true, message: 'Nộp đơn đăng ký thành công. Đang chờ duyệt.', data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server trong quá trình nộp đơn' });
        }
    }

    // Lấy danh sách đăng ký của CÁ NHÂN (User)
    async getMyApplications(req, res) {
        try {
            const id_User = req.params.id_User;
            const data = await DiscountRegistrationService.getMyRegistrations(id_User);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Admin lấy tất cả đơn pending
    async getPending(req, res) {
        try {
            const data = await DiscountRegistrationService.getPendingRegistrations();
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Admin duyệt/từ chối đơn
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, expiry_date, rejected_reason, approved_by } = req.body;

            if (status !== 'approved' && status !== 'rejected') {
                return res.status(400).json({ success: false, message: 'Status phải là approved hoặc rejected' });
            }

            const data = await DiscountRegistrationService.updateStatus(id, {
                status,
                expiry_date,
                rejected_reason,
                approved_by
            });

            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký' });
            }

            res.status(200).json({ success: true, message: `Thao tác ${status} thành công`, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const success = await DiscountRegistrationService.delete(id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ để xóa' });
            }
            res.status(200).json({ success: true, message: 'Xóa hồ sơ thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server khi xóa hồ sơ' });
        }
    }
}

module.exports = new DiscountRegistrationController();
