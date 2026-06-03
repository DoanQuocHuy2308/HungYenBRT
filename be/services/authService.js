const db = require('../models');
const Employee = db.employees;
const User = db.users;
const Role = db.roles;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

/**
 * Helper: Di chuyển file từ thư mục tạm sang chính thức
 */
const moveTempFile = (tempPath) => {
    if (!tempPath || !tempPath.startsWith('/temp_uploads/')) return tempPath;

    const fileName = tempPath.replace('/temp_uploads/', '');
    const oldPath = path.join(__dirname, '..', 'temp_uploads', fileName);
    const newPath = path.join(__dirname, '..', 'uploads', fileName);

    try {
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            return `/uploads/${fileName}`;
        }
    } catch (err) {
        console.error(`[MOVE FILE ERROR] From ${oldPath} to ${newPath}:`, err.message);
    }
    return tempPath;
};

class AuthService {
    static async loginEmployee(username, password) {
        try {
            const employee = await Employee.findOne({
                where: { username },
                include: [
                    {
                        model: User,
                        include: [
                            {
                                model: Role
                            }
                        ]
                    }
                ]
            });

            if (!employee) {
                return { success: false, status: 404, message: 'Username không tồn tại' };
            }

            const isMatch = await bcrypt.compare(password, employee.password);
            if (!isMatch) {
                return { success: false, status: 401, message: 'Mật khẩu không chính xác' };
            }

            const payload = {
                id: employee.Id,
                username: employee.username,
                userId: employee.Id_User,
                role: employee.user?.role?.Name
            };

            // Cập nhật trạng thái ON (true)
            if (employee.user) {
                employee.user.status = true;
                await employee.user.save();
            }

            const secretKey = process.env.JWT_SECRET || 'doanquochuy23082004';
            const token = jwt.sign(payload, secretKey, { expiresIn: '1d' });

            // Loại bỏ thông tin nhạy cảm trước khi trả về client (Bảo mật - Thực chiến)
            const userDataResult = employee.user ? employee.user.toJSON() : null;
            if (userDataResult && userDataResult.password) {
                delete userDataResult.password;
            }

            return {
                success: true,
                status: 200,
                message: 'Đăng nhập thành công',
                token: token,
                data: {
                    id: employee.Id,
                    username: employee.username,
                    shiftStart: employee.shiftStart,
                    shiftEnd: employee.shiftEnd,
                    user: userDataResult
                }
            };
        } catch (error) {
            throw error;
        }
    }

    static async loginCustomer(cccd_number, password) {
        try {
            const user = await User.findOne({
                where: { cccd_number },
                include: [{ model: Role }]
            });

            if (!user) {
                return { success: false, status: 404, message: 'Số CCCD không tồn tại' };
            }

            if (!user.password) {
                return { success: false, status: 400, message: 'Tài khoản chưa thiếp lập mật khẩu' };
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return { success: false, status: 401, message: 'Mật khẩu không chính xác' };
            }

            const payload = {
                userId: user.id,
                cccd_number: user.cccd_number,
                role: user.role?.Name
            };

            // Cập nhật trạng thái ON (true) khi đăng nhập thành công
            user.status = true;
            await user.save();

            const secretKey = process.env.JWT_SECRET || 'doanquochuy23082004';
            const token = jwt.sign(payload, secretKey, { expiresIn: '7d' });

            return {
                success: true,
                status: 200,
                message: 'Khách hàng đăng nhập thành công',
                token: token,
                data: {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    birthday: user.birthday,
                    avatar: user.avatar,
                    cccd_number: user.cccd_number,
                    is_face_registered: user.is_face_registered
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Tính tuổi từ ngày sinh (hỗ trợ DD/MM/YYYY, YYYY-MM-DD, DDMMYYYY)
     */
    static _calculateAge(birthday) {
        if (!birthday) return null;
        let dob;
        const str = String(birthday).trim();
        // Format: DD/MM/YYYY hoặc DDMMYYYY (từ quét CCCD)
        if (/^\d{8}$/.test(str)) {
            dob = new Date(`${str.slice(4, 8)}-${str.slice(2, 4)}-${str.slice(0, 2)}`);
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split('/');
            dob = new Date(`${y}-${m}-${d}`);
        } else {
            dob = new Date(str);
        }
        if (isNaN(dob.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
        return age;
    }

    static async registerCustomer(userData) {
        try {
            const existingUserPhone = await User.findOne({ where: { phone: userData.phone } });
            if (existingUserPhone) {
                return { success: false, status: 400, message: 'Số điện thoại đã được sử dụng' };
            }

            const existingUserCccd = await User.findOne({ where: { cccd_number: userData.cccd_number } });
            if (existingUserCccd) {
                return { success: false, status: 400, message: 'Số CCCD đã được sử dụng' };
            }

            if(userData.password) {
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(userData.password, salt);
            }

            // Xử lý email rỗng
            if (!userData.email || userData.email.trim() === '') {
                userData.email = null;
            }

            // Xử lý di chuyển ảnh từ thư mục Tạm sang Chính thức (Tránh rác máy chủ)
            if (userData.cccd_front) userData.cccd_front = moveTempFile(userData.cccd_front);
            if (userData.cccd_back) userData.cccd_back = moveTempFile(userData.cccd_back);

            const newUser = await User.create(userData);

            // ── Tự động cấp Vé Miễn Phí (Người Cao Tuổi) nếu tuổi >= 60 ──────────────
            let elderlyTicketGranted = false;
            const age = AuthService._calculateAge(userData.birthday);
            if (age !== null && age >= 60) {
                try {
                    const ELDERLY_TICKET_TYPE_ID = 23; 
                    const ticketType = await db.ticket_types.findByPk(ELDERLY_TICKET_TYPE_ID);
                    if (ticketType && ticketType.is_active) {
                        // Tạo đơn hàng với tổng tiền = 0
                        const order = await db.tickets.create({
                            Id_User: newUser.id,
                            total_quantity: 1,
                            total_price: 0,
                            status: 'COMPLETED',
                            PaymentNote: 'Vé miễn phí tự động cấp cho người cao tuổi (>=60 tuổi)'
                        });
                        // Tạo vé chi tiết — EndDate = null (vĩnh viễn)
                        await db.ticket_details.create({
                            Id_Order: order.Id,
                            Id_Ticket_Type: ELDERLY_TICKET_TYPE_ID,
                            price: 0,
                            status: 'ACTIVE',
                            IsFree: true,
                            StartDate: new Date(),
                            EndDate: null // Vĩnh viễn
                        });

                        // Cấp quyền vào tất cả các ga (toàn tuyến)
                        const allLocations = await db.locations.findAll({ attributes: ['Id'] });
                        if (allLocations.length > 0) {
                            const ticketDetail = await db.ticket_details.findOne({
                                where: { Id_Order: order.Id },
                                order: [['createdAt', 'DESC']]
                            });
                            if (ticketDetail) {
                                const locationEntries = allLocations.map(loc => ({
                                    Id_Ticket: ticketDetail.Id,
                                    Id_Location: loc.Id
                                }));
                                await db.ticket_location.bulkCreate(locationEntries, { ignoreDuplicates: true });
                            }
                        }
                        elderlyTicketGranted = true;
                        console.log(`[AUTO-TICKET] Cấp Vé Người Cao Tuổi miễn phí cho user ${newUser.id} (${age} tuổi)`);
                    }
                } catch (ticketErr) {
                    // Không rollback đăng ký — chỉ log lỗi cấp vé
                    console.error('[AUTO-TICKET ERROR] Không thể cấp vé người cao tuổi:', ticketErr.message);
                }
            }

            return {
                success: true,
                status: 201,
                message: elderlyTicketGranted
                    ? 'Đăng ký thành công! Vé miễn phí dành cho người cao tuổi đã được cấp vào tài khoản của bạn.'
                    : 'Đăng ký khách hàng thành công',
                data: {
                    user: {
                       id: newUser.id,
                       name: newUser.name,
                       phone: newUser.phone,
                       cccd_number: newUser.cccd_number,
                       elderlyTicketGranted
                    }
                }
            };
        } catch (error) {
            throw error;
        }
    }

    static async registerEmployee(userData, employeeData) {
        const transaction = await db.sequelize.transaction();
        try {
            const existingEmployee = await Employee.findOne({ where: { username: employeeData.username }, transaction });
            if (existingEmployee) {
                await transaction.rollback();
                return { success: false, status: 400, message: 'Username đã tồn tại' };
            }

            const existingUserPhone = await User.findOne({ where: { phone: userData.phone }, transaction });
            if (existingUserPhone) {
                await transaction.rollback();
                return { success: false, status: 400, message: 'Số điện thoại đã được sử dụng' };
            }

            const existingUserCccd = await User.findOne({ where: { cccd_number: userData.cccd_number }, transaction });
            if (existingUserCccd) {
                await transaction.rollback();
                return { success: false, status: 400, message: 'Số CCCD đã được sử dụng' };
            }

            if(userData.password) {
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(userData.password, salt);
            }

            // Xử lý email rỗng
            if (!userData.email || userData.email.trim() === '') {
                userData.email = null;
            }

            const newUser = await User.create(userData, { transaction });

            const empSalt = await bcrypt.genSalt(10);
            const hashedEmpPassword = await bcrypt.hash(employeeData.password, empSalt);

            const newEmployee = await Employee.create({
                Id_User: newUser.id,
                username: employeeData.username,
                password: hashedEmpPassword,
                shiftStart: employeeData.shiftStart,
                shiftEnd: employeeData.shiftEnd
            }, { transaction });

            await transaction.commit();

            return {
                success: true,
                status: 201,
                message: 'Đăng ký nhân viên thành công',
                data: {
                    user: newUser.id,
                    username: newEmployee.username
                }
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async logout(userId) {
        try {
            const user = await User.findByPk(userId);
            if (user) {
                user.status = false; // Tắt trạng thái OFF
                await user.save();
            }
            return {
                success: true,
                status: 200,
                message: 'Đăng xuất thành công, đã cập nhật trạng thái OFF'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthService;
