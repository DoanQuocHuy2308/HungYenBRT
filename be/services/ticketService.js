const db = require('../models');
const { Op } = require('sequelize');

class TicketService {
    // ─── Purchase: 1 Order -> N Details ──────────────────────────────────────────
    async purchaseTicket({ 
        Id_Ticket_Type, Id_User, Quantity = 1, price,
        code_promotion, id_payment, id_payment_method, id_employee, IsFree = false,
        From_Location, To_Location, transaction_id
    }) {
        let validEmployeeId = null;
        if (id_employee) {
            const empCount = await db.employees.count({ where: { Id: id_employee } });
            if (empCount > 0) validEmployeeId = id_employee;
            else console.warn(`[WARNING] purchaseTicket: id_employee ${id_employee} not found in DB, setting to null.`);
        }

        let order;
        const transaction = await db.sequelize.transaction();
        try {
            // Tạo mã đối soát ngẫu nhiên (Chữ và Số) cho cả chuyển khoản và tiền mặt
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const finalTransactionId = transaction_id || `BRT-${randomCode}`;
            order = await db.tickets.create({
                Id_User,
                total_quantity: Quantity,
                total_price: price * Quantity,
                code_promotion,
                id_payment,
                id_payment_method, 
                id_employee: validEmployeeId,
                status: 'COMPLETED', 
                PaymentNote: finalTransactionId 
            }, { transaction });

            // 1b. Create Payment record for Revenue tracking
            const payMethod = await db.payment_methods.findByPk(id_payment_method);
            const pmName = payMethod ? payMethod.Name : 'Tiền mặt';
            await db.payments.create({
                PaymentMethod: pmName,
                TransactionId: finalTransactionId,
                Amount: price * Quantity,
                created_at: new Date()
            }, { transaction });

            // 2. Create Individual Ticket Details
            const details = [];
            for (let i = 0; i < Quantity; i++) {
                details.push({
                    Id_Order: order.Id,
                    Id_Ticket_Type,
                    From_Location,
                    To_Location,
                    price: price, // Giá của từng chiếc vé
                    status: 'UNUSED',
                    IsFree: IsFree
                });
            }
            const createdDetails = await db.ticket_details.bulkCreate(details, { transaction });
            
            // 3. Tự động lưu các địa điểm cho phép vào ticket_location
            const type = await db.ticket_types.findByPk(Id_Ticket_Type);
            const isTrip = type?.Id_Category === 1;
            const isTimeOrPromo = type?.Id_Category === 2 || type?.Id_Category === 3;

            if (isTrip && From_Location && To_Location) {
                // Logic cho vé lượt: Ga trong khoảng order_index
                const [locFrom, locTo] = await Promise.all([
                    db.locations.findByPk(From_Location),
                    db.locations.findByPk(To_Location)
                ]);

                if (locFrom && locTo) {
                    const minIdx = Math.min(locFrom.order_index, locTo.order_index);
                    const maxIdx = Math.max(locFrom.order_index, locTo.order_index);

                    const allowedLocations = await db.locations.findAll({
                        where: { order_index: { [Op.between]: [minIdx, maxIdx] } },
                        attributes: ['Id']
                    });

                    if (allowedLocations.length > 0) {
                        const ticketLocs = [];
                        for (const detail of createdDetails) {
                            for (const loc of allowedLocations) {
                                ticketLocs.push({ Id_Ticket: detail.Id, Id_Location: loc.Id });
                            }
                        }
                        await db.ticket_location.bulkCreate(ticketLocs, { transaction });
                    }
                }
            } else if (isTimeOrPromo) {
                // Logic cho vé thời gian/ưu đãi: Tất cả các ga
                const allLocations = await db.locations.findAll({ attributes: ['Id'] });
                if (allLocations.length > 0) {
                    const ticketLocs = [];
                    for (const detail of createdDetails) {
                        for (const loc of allLocations) {
                            ticketLocs.push({ Id_Ticket: detail.Id, Id_Location: loc.Id });
                        }
                    }
                    await db.ticket_location.bulkCreate(ticketLocs, { transaction });
                }
            }

            await transaction.commit();
        } catch (err) {
            if (!transaction.finished) {
                await transaction.rollback();
            }
            throw err;
        }
        
        return await this.getOrderDetail(order.Id);
    }

    // ─── Purchase Time Ticket (New) ──────────────────────────────────────────
    async purchaseTimeTicket({ 
        Id_Ticket_Type, userData, 
        id_payment_method, id_employee, transaction_id, code_promotion
    }) {
        const transaction = await db.sequelize.transaction();
        try {
            // 1. Handle User (Create or Update)
            let user = await db.users.findOne({ 
                where: { 
                    [Op.or]: [
                        { cccd_number: userData.cccd_number },
                        { phone: userData.phone }
                    ]
                },
                transaction 
            });

            // Xử lý mã hóa mật khẩu nếu có
            if (userData.password) {
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(userData.password, salt);
            }

            // Xử lý email rỗng
            if (!userData.email || userData.email.trim() === '') {
                userData.email = null;
            }

            if (!user) {
                user = await db.users.create({
                    ...userData,
                    id_Role: 3, // Customer
                    status: false,
                    is_locked: false
                }, { transaction });
            } else {
                // Update existing user info (e.g. email, address, password)
                await user.update(userData, { transaction });
            }

            // 2. Get Ticket Type info for price and duration
            const ticketType = await db.ticket_types.findByPk(Id_Ticket_Type, { transaction });
            if (!ticketType) throw new Error('Loại vé không tồn tại');

            // 3. Create Ticket (Order)
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const finalTransactionId = transaction_id || `BRT-T-${randomCode}`;
            
            const order = await db.tickets.create({
                Id_User: user.id,
                total_quantity: 1,
                total_price: userData.price || 0,
                id_payment_method,
                id_employee,
                status: 'COMPLETED',
                PaymentNote: finalTransactionId,
                code_promotion: code_promotion || null
            }, { transaction });

            // 4. Create Payment record
            const payMethod = await db.payment_methods.findByPk(id_payment_method, { transaction });
            await db.payments.create({
                PaymentMethod: payMethod ? payMethod.Name : 'Tiền mặt',
                TransactionId: finalTransactionId,
                Amount: userData.price || 0,
                created_at: new Date()
            }, { transaction });

            // 5. Create Ticket Detail with Expiry
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + ticketType.Duration_Day);

            const detail = await db.ticket_details.create({
                Id_Order: order.Id,
                Id_Ticket_Type,
                price: userData.price || 0,
                status: 'ACTIVE', // Automatically active for time tickets? Or UNUSED until first scan?
                // For POS purchase, usually starts immediately
                StartDate: startDate,
                EndDate: endDate,
                qr_token: db.sequelize.literal('UUID()') 
            }, { transaction });

            // 6. Link to all locations (Time tickets are cross-line)
            const allLocations = await db.locations.findAll({ attributes: ['Id'], transaction });
            const ticketLocs = allLocations.map(loc => ({
                Id_Ticket: detail.Id,
                Id_Location: loc.Id
            }));
            await db.ticket_location.bulkCreate(ticketLocs, { transaction });

            await transaction.commit();
            return await this.getOrderDetail(order.Id);
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    // ─── User: My Orders ────────────────────────────────────────────────────────
    async getMyOrders(id_User) {
        return await db.tickets.findAll({
            where: { Id_User: id_User },
            include: [
                { 
                    model: db.ticket_details, 
                    as: 'details',
                    include: [
                        { model: db.ticket_types, as: 'ticket_type' },
                        { model: db.locations, as: 'fromLocation', attributes: ['Name'] },
                        { model: db.locations, as: 'toLocation', attributes: ['Name'] }
                    ]
                }
            ],
            order: [['PurchaseDate', 'DESC']]
        });
    }

    // ─── Admin: All Orders with Summary ─────────────────────────────────────────
    async getAllOrders({ status, id_User, search } = {}) {
        const whereOrder = {};
        if (status) whereOrder.status = status;
        if (id_User) whereOrder.Id_User = id_User;

        const include = [
            { model: db.users, as: 'user', attributes: ['name', 'email', 'phone', 'avatar'] },
            { model: db.employees, as: 'employee', attributes: ['username'] },
            { model: db.payment_methods, as: 'payment_method', attributes: ['Name', 'Code'] },
            { 
                model: db.ticket_details, 
                as: 'details',
                include: [
                    { model: db.ticket_types, as: 'ticket_type', attributes: ['Name', 'Id_Category'] },
                    { model: db.locations, as: 'fromLocation', attributes: ['Name'] },
                    { model: db.locations, as: 'toLocation', attributes: ['Name'] }
                ]
            }
        ];

        let orders = await db.tickets.findAll({
            where: whereOrder,
            include,
            order: [['PurchaseDate', 'DESC']]
        });

        if (search) {
            const s = search.toLowerCase();
            orders = orders.filter(o => 
                o.user?.name?.toLowerCase().includes(s) || 
                o.Id.toLowerCase().includes(s)
            );
        }

        return orders;
    }

    // ─── Admin: Get Deep Detail of an Order ──────────────────────────────────────
    async getOrderDetail(orderId) {
        return await db.tickets.findByPk(orderId, {
            include: [
                { model: db.users, as: 'user' },
                { model: db.employees, as: 'employee' },
                { model: db.payments, as: 'payment' },
                { 
                    model: db.ticket_details, 
                    as: 'details',
                    include: [
                        { model: db.ticket_types, as: 'ticket_type' },
                        { model: db.locations, as: 'fromLocation' },
                        { model: db.locations, as: 'toLocation' },
                        { model: db.locations, as: 'lastLocation' }
                    ]
                }
            ]
        });
    }

    // ─── Admin: Manage Individual Ticket Status ───────────────────────────────────
    async setTicketStatus(detailId, status) {
        const ticket = await db.ticket_details.findByPk(detailId);
        if (!ticket) return null;
        return await ticket.update({ status });
    }

    // ─── Admin: Xóa Đơn Hàng ──────────────────────────────────────────────────────
    async deleteOrder(orderId) {
        const transaction = await db.sequelize.transaction();
        try {
            const order = await db.tickets.findByPk(orderId, { include: [{ model: db.ticket_details, as: 'details' }] });
            if (!order) {
                await transaction.rollback();
                return false;
            }

            // Xóa vé con và logs, locations liên quan
            if (order.details && order.details.length > 0) {
                for (const detail of order.details) {
                    await db.ticket_logs.destroy({ where: { Id_Ticket: detail.Id }, transaction });
                    await db.ticket_location.destroy({ where: { Id_Ticket: detail.Id }, transaction });
                    await detail.destroy({ transaction });
                }
            }

            // Xóa payment liên quan
            if (order.PaymentNote) {
                await db.payments.destroy({ where: { TransactionId: order.PaymentNote }, transaction });
            }

            // Cuối cùng xóa order
            await order.destroy({ transaction });
            
            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    // ─── Admin: Manage Order Status ──────────────────────────────────────────────
    async setOrderStatus(orderId, status) {
        const order = await db.tickets.findByPk(orderId, { include: [{ model: db.ticket_details, as: 'details' }] });
        if (!order) return null;
        
        const transaction = await db.sequelize.transaction();
        try {
            await order.update({ status }, { transaction });
            
            // Nếu hủy đơn hàng, tự động lock các vé con
            if (status === 'CANCELLED' || status === 'REFUNDED') {
                await db.ticket_details.update(
                    { status: 'LOCKED' },
                    { where: { Id_Order: orderId }, transaction }
                );
            }

            await transaction.commit();
            return order;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    // ─── Admin: Dashboard Stats (Simple) ────────────────────────────────────────
    async getTicketStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [ordersToday, totalRevenue, activeTickets, usedTickets] = await Promise.all([
            db.tickets.count({ where: { PurchaseDate: { [Op.between]: [today, tomorrow] } } }),
            db.tickets.sum('total_price', { where: { status: 'COMPLETED' } }),
            db.ticket_details.count({ where: { status: 'UNUSED' } }),
            db.ticket_details.count({ where: { status: 'USED' } })
        ]);

        return { ordersToday, totalRevenue: totalRevenue || 0, activeTickets, usedTickets };
    }

    // ─── Admin: Full Statistics Dashboard ───────────────────────────────────────
    async getFullStats(range = '7d', customStart, customEnd) {
        let now = new Date();
        let startDate = new Date(now);

        if (range === 'custom' && customStart && customEnd) {
            startDate = new Date(customStart);
            now = new Date(customEnd);
        } else if (range === 'today') {
            startDate.setHours(0, 0, 0, 0);
        } else if (range === 'yesterday') {
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            now.setDate(now.getDate() - 1);
            now.setHours(23, 59, 59, 999);
        } else if (range === '7d') {
            startDate.setDate(startDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
        } else if (range === '30d') {
            startDate.setDate(startDate.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
        } else if (range === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const dateWhere = { PurchaseDate: { [Op.between]: [startDate, now] }, status: 'COMPLETED' };

        // ── 1. KPI Summary ──────────────────────────────────────────────────────
        const [totalOrders, totalRevenue, totalTicketItems, totalUsers] = await Promise.all([
            db.tickets.count({ where: dateWhere }),
            db.tickets.sum('total_price', { where: dateWhere }),
            db.ticket_details.count({
                include: [{ model: db.tickets, as: 'order', where: dateWhere }]
            }),
            db.tickets.count({ where: dateWhere, distinct: true, col: 'Id_User' }),
        ]);

        // ── 2. Revenue by day (for chart) ───────────────────────────────────────
        const allOrders = await db.tickets.findAll({
            where: dateWhere,
            attributes: ['PurchaseDate', 'total_price'],
            include: [{
                model: db.ticket_details, as: 'details',
                attributes: ['Id_Ticket_Type'],
                include: [{ model: db.ticket_types, as: 'ticket_type', attributes: ['Id_Category'] }]
            }]
        });

        const dayMap = {};
        allOrders.forEach(order => {
            const d = new Date(order.PurchaseDate);
            const key = `${d.getDate()}/${d.getMonth() + 1}`;
            if (!dayMap[key]) dayMap[key] = { day: key, trip: 0, time: 0, total: 0, count: 0 };
            const isTime = order.details?.[0]?.ticket_type?.Id_Category === 2;
            const amt = parseFloat(order.total_price) || 0;
            if (isTime) dayMap[key].time += amt;
            else dayMap[key].trip += amt;
            dayMap[key].total += amt;
            dayMap[key].count += 1;
        });
        const revenueByDay = Object.values(dayMap).slice(-30);

        // ── 3. Revenue by payment method ────────────────────────────────────────
        const ordersWithMethod = await db.tickets.findAll({
            where: dateWhere,
            attributes: ['total_price'],
            include: [{ model: db.payment_methods, as: 'payment_method', attributes: ['Name', 'Code'] }]
        });
        const methodMap = {};
        ordersWithMethod.forEach(o => {
            const name = o.payment_method?.Name || 'Tiền mặt';
            if (!methodMap[name]) methodMap[name] = { method: name, revenue: 0, count: 0 };
            methodMap[name].revenue += parseFloat(o.total_price) || 0;
            methodMap[name].count += 1;
        });
        const revenueByMethod = Object.values(methodMap).sort((a, b) => b.revenue - a.revenue);

        // ── 4. Ticket type breakdown ─────────────────────────────────────────────
        const detailsWithType = await db.ticket_details.findAll({
            include: [
                { model: db.tickets, as: 'order', where: dateWhere, attributes: ['total_price'] },
                { model: db.ticket_types, as: 'ticket_type', attributes: ['Name', 'Id_Category'] }
            ]
        });
        const typeMap = {};
        detailsWithType.forEach(d => {
            const name = d.ticket_type?.Name || 'Khác';
            if (!typeMap[name]) typeMap[name] = { name, count: 0, revenue: 0, category: d.ticket_type?.Id_Category };
            typeMap[name].count += 1;
            typeMap[name].revenue += parseFloat(d.order?.total_price || 0);
        });
        const ticketTypeBreakdown = Object.values(typeMap).sort((a, b) => b.count - a.count).slice(0, 8);

        // ── 5. Top routes (from → to) ────────────────────────────────────────────
        const tripDetails = await db.ticket_details.findAll({
            where: { From_Location: { [Op.ne]: null }, To_Location: { [Op.ne]: null } },
            include: [
                { model: db.tickets, as: 'order', where: dateWhere, attributes: [] },
                { model: db.locations, as: 'fromLocation', attributes: ['Name'] },
                { model: db.locations, as: 'toLocation', attributes: ['Name'] }
            ],
            attributes: ['From_Location', 'To_Location']
        });
        const routeMap = {};
        tripDetails.forEach(d => {
            const key = `${d.fromLocation?.Name || '?'} → ${d.toLocation?.Name || '?'}`;
            routeMap[key] = (routeMap[key] || 0) + 1;
        });
        const topRoutes = Object.entries(routeMap)
            .map(([route, count]) => ({ route, count }))
            .sort((a, b) => b.count - a.count).slice(0, 6);
        const maxRoute = topRoutes[0]?.count || 1;
        topRoutes.forEach(r => r.pct = Math.round((r.count / maxRoute) * 100));

        // ── 6. Hourly heatmap (today) ─────────────────────────────────────────────
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const todayOrders = await db.tickets.findAll({
            where: { PurchaseDate: { [Op.between]: [todayStart, todayEnd] } },
            attributes: ['PurchaseDate']
        });
        const hourMap = {};
        for (let h = 5; h <= 22; h++) hourMap[h] = 0;
        todayOrders.forEach(o => {
            const h = new Date(o.PurchaseDate).getHours();
            if (h >= 5 && h <= 22) hourMap[h] = (hourMap[h] || 0) + 1;
        });
        const hourlyHeatmap = Object.entries(hourMap).map(([hour, count]) => ({
            hour: String(hour).padStart(2, '0'), count
        }));

        // ── 7. Recent transactions ─────────────────────────────────────────────────
        const recentTransactions = await db.tickets.findAll({
            where: { status: 'COMPLETED' },
            order: [['PurchaseDate', 'DESC']],
            limit: 10,
            include: [
                { model: db.users, as: 'user', attributes: ['name', 'phone'] },
                { model: db.payment_methods, as: 'payment_method', attributes: ['Name', 'Code'] },
                {
                    model: db.ticket_details, as: 'details', limit: 1,
                    include: [
                        { model: db.ticket_types, as: 'ticket_type', attributes: ['Name', 'Id_Category'] },
                        { model: db.locations, as: 'fromLocation', attributes: ['Name'] },
                        { model: db.locations, as: 'toLocation', attributes: ['Name'] }
                    ]
                }
            ]
        });

        // ── 8. Top employees by revenue ─────────────────────────────────────────────
        const topEmployeesRaw = await db.tickets.findAll({
            where: { ...dateWhere, id_employee: { [Op.ne]: null } },
            attributes: [
                'id_employee',
                [db.sequelize.fn('SUM', db.sequelize.col('total_price')), 'revenue'],
                [db.sequelize.fn('COUNT', db.sequelize.col('tickets.id')), 'orderCount']
            ],
            include: [{
                model: db.employees,
                as: 'employee',
                attributes: ['id'],
                include: [{ model: db.users, attributes: ['name', 'avatar'] }]
            }],
            group: ['id_employee', 'employee.id', 'employee->user.id', 'employee->user.name', 'employee->user.avatar'],
            order: [[db.sequelize.fn('SUM', db.sequelize.col('total_price')), 'DESC']],
            limit: 5,
            raw: false
        });

        const topEmployees = topEmployeesRaw.map(e => ({
            id: e.id_employee,
            name: e.employee?.user?.name || 'Chưa cập nhật',
            avatar: e.employee?.user?.avatar || null,
            revenue: parseFloat(e.get('revenue')) || 0,
            orderCount: parseInt(e.get('orderCount')) || 0
        }));

        return {
            summary: {
                totalOrders,
                totalRevenue: totalRevenue || 0,
                totalTicketItems,
                totalUniqueUsers: totalUsers,
                avgOrderValue: totalOrders ? Math.round((totalRevenue || 0) / totalOrders) : 0,
            },
            revenueByDay,
            revenueByMethod,
            ticketTypeBreakdown,
            topRoutes,
            hourlyHeatmap,
            recentTransactions: recentTransactions.map(t => {
                const detail = t.details?.[0];
                const isTime = detail?.ticket_type?.Id_Category === 2;
                return {
                    id: t.Id.substring(0, 8).toUpperCase(),
                    type: isTime ? 'time' : 'trip',
                    customer: t.user?.name || 'Khách vãng lai',
                    route: isTime ? detail?.ticket_type?.Name : `${detail?.fromLocation?.Name || 'Bất kỳ'} → ${detail?.toLocation?.Name || 'Bất kỳ'}`,
                    amount: parseFloat(t.total_price),
                    method: t.payment_method?.Name || 'Tiền mặt',
                    methodCode: t.payment_method?.Code || 'CASH',
                    time: t.PurchaseDate,
                };
            }),
            topEmployees
        };
    }

    // ─── Staff: Statistics ──────────────────────────────────────────────────────
    async getStaffStats(employeeId, timeRange) {
        // Fetch employee to get shift hours
        const employee = await db.employees.findByPk(employeeId);
        if (!employee) throw new Error('Không tìm thấy nhân viên');

        const shiftStartStr = employee.shiftStart || '00:00:00';
        const shiftEndStr = employee.shiftEnd || '23:59:59';

        const today = new Date();
        // Base start date
        let startDate = new Date(today);
        let endDate = new Date(today);

        if (timeRange === 'yesterday') {
            startDate.setDate(startDate.getDate() - 1);
            endDate.setDate(endDate.getDate() - 1);
        } else if (timeRange === '7d') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === '30d') {
            startDate.setDate(startDate.getDate() - 30);
        }

        // Apply shift hours to the date(s)
        const [startH, startM, startS] = shiftStartStr.split(':');
        const [endH, endM, endS] = shiftEndStr.split(':');

        startDate.setHours(parseInt(startH), parseInt(startM), parseInt(startS || 0), 0);
        
        // If it's a multi-day range, endDate should be the end of the shift on the *last* day (today)
        endDate.setHours(parseInt(endH), parseInt(endM), parseInt(endS || 59), 999);

        // Handle case where shift crosses midnight (e.g. 22:00 to 06:00)
        if (parseInt(endH) < parseInt(startH) && (timeRange === 'today' || timeRange === 'yesterday')) {
             endDate.setDate(endDate.getDate() + 1);
        }

        const whereCondition = {
            id_employee: employeeId,
            PurchaseDate: { [Op.between]: [startDate, endDate] }
        };

        const [ordersShift, totalRevenueShift, totalTicketsShift, recentTransactions] = await Promise.all([
            db.tickets.count({ where: whereCondition }),
            db.tickets.sum('total_price', { where: { ...whereCondition, status: 'COMPLETED' } }),
            db.ticket_details.count({ 
                include: [{ model: db.tickets, as: 'order', where: whereCondition }] 
            }),
            db.tickets.findAll({
                where: whereCondition,
                order: [['PurchaseDate', 'DESC']],
                limit: 5,
                include: [
                    { model: db.payment_methods, as: 'payment_method' },
                    { model: db.users, as: 'user' },
                    { model: db.ticket_details, as: 'details', include: [{ model: db.ticket_types, as: 'ticket_type' }, { model: db.locations, as: 'fromLocation' }, { model: db.locations, as: 'toLocation' }] }
                ]
            })
        ]);

        return {
            ordersShift,
            totalRevenueShift: totalRevenueShift || 0,
            totalTicketsShift,
            recentTransactions: recentTransactions.map(t => {
                const isMonthly = t.details[0]?.ticket_type?.Id_Category === 2;
                return {
                    id: t.Id.split('-')[0].toUpperCase(),
                    type: isMonthly ? 'monthly' : 'single',
                    customer: t.user ? t.user.name : 'Khách vãng lai',
                    station: isMonthly ? t.details[0]?.ticket_type?.Name : `${t.details[0]?.fromLocation?.Name || 'Bất kỳ'} → ${t.details[0]?.toLocation?.Name || 'Bất kỳ'}`,
                    amount: parseFloat(t.total_price),
                    method: t.payment_method ? t.payment_method.Name : 'Tiền mặt',
                    time: t.PurchaseDate
                };
            })
        };
    }
}

module.exports = new TicketService();
