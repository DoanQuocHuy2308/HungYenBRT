const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, message: 'Vui lòng cung cấp token để truy cập' });
    }

    try {
        const secretKey = process.env.JWT_SECRET || 'doanquochuy23082004';
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // payload chứa userId, role...
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}

// Middleware: Chỉ cho phép Admin truy cập
function requireAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'Admin') {
            next();
        } else {
            return res.status(403).json({ success: false, message: 'Từ chối truy cập: Chỉ Quản trị viên (Admin) mới có quyền này' });
        }
    });
}

// Middleware: Dành cho nội bộ (Admin hoặc Nhân viên Staff)
function requireStaffOrAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user && (req.user.role === 'Admin' || req.user.role === 'Nhân viên')) {
            next();
        } else {
            return res.status(403).json({ success: false, message: 'Từ chối truy cập: Tài khoản không có phân quyền Nhân viên/Quản trị' });
        }
    });
}

// Middleware: Khách hàng (Hoặc để trống nếu user bt cũng dùng được)
function requireCustomer(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'Khách hàng') {
            next();
        } else {
            return res.status(403).json({ success: false, message: 'Từ chối truy cập: Tính năng này chỉ dành cho Khách hàng' });
        }
    });
}

module.exports = {
    verifyToken,
    requireAdmin,
    requireStaffOrAdmin,
    requireCustomer
};
