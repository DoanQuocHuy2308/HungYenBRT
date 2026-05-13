import { axiosClient } from '../api_client/axiosClient';

// ═══════════════════════════════════════════════════
//  EMPLOYEE SERVICE
// ═══════════════════════════════════════════════════
export const employeeService = {
    getAll: (params?: { search?: string; page?: number; limit?: number }) =>
        axiosClient.get('/employees', { params }),

    getById: (id: string) =>
        axiosClient.get(`/employees/${id}`),

    create: (formData: FormData) =>
        axiosClient.post('/auth/register-employee', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    update: (id: string, data: Record<string, any>) =>
        axiosClient.put(`/employees/${id}`, data),

    delete: (id: string) =>
        axiosClient.delete(`/employees/${id}`),

    changeRole: (id: string, roleId: number) =>
        axiosClient.patch(`/employees/${id}/role`, { roleId }),

    toggleLock: (id: string) =>
        axiosClient.patch(`/employees/${id}/toggle-lock`),

    resetPassword: (id: string, newPassword: string) =>
        axiosClient.patch(`/employees/${id}/reset-password`, { newPassword }),

    getStats: () =>
        axiosClient.get('/employees/stats'),
};

// ═══════════════════════════════════════════════════
//  USER / CUSTOMER SERVICE
// ═══════════════════════════════════════════════════
export const userService = {
    getCustomers: (params?: { search?: string; page?: number; limit?: number }) =>
        axiosClient.get('/users/customers', { params }),

    getAll: () =>
        axiosClient.get('/users'),

    getById: (id: string) =>
        axiosClient.get(`/users/${id}`),

    update: (id: string, data: Record<string, any>) =>
        axiosClient.put(`/users/${id}`, data),

    delete: (id: string) =>
        axiosClient.delete(`/users/${id}`),

    toggleLock: (id: string) =>
        axiosClient.patch(`/users/${id}/toggle-lock`),

    getStats: () =>
        axiosClient.get('/users/stats'),
};

// ═══════════════════════════════════════════════════
//  ROLES SERVICE
// ═══════════════════════════════════════════════════
export const roleService = {
    getAll: () =>
        axiosClient.get('/roles'),

    getById: (id: number) =>
        axiosClient.get(`/roles/${id}`),

    create: (data: { Name: string; Description?: string }) =>
        axiosClient.post('/roles', data),

    update: (id: number, data: { Name?: string; Description?: string }) =>
        axiosClient.put(`/roles/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/roles/${id}`),
};

// ═══════════════════════════════════════════════════
//  LOCATION SERVICE
// ═══════════════════════════════════════════════════
export const locationService = {
    getAll: (params?: { search?: string }) =>
        axiosClient.get('/locations', { params }),

    getById: (id: number) =>
        axiosClient.get(`/locations/${id}`),

    getStats: () =>
        axiosClient.get('/locations/stats'),

    create: (data: Record<string, any>) =>
        axiosClient.post('/locations', data),

    update: (id: number, data: Record<string, any>) =>
        axiosClient.put(`/locations/${id}`, data),

    updateCoordinates: (id: number, data: { latitude: number; longitude: number }) =>
        axiosClient.patch(`/locations/${id}/coordinates`, data),

    swapOrder: (id1: number, id2: number) =>
        axiosClient.post('/locations/order/swap', { id1, id2 }),

    reorder: (items: { id: number; order_index: number }[]) =>
        axiosClient.post('/locations/order/reorder', { items }),

    delete: (id: number) =>
        axiosClient.delete(`/locations/${id}`),
};

// ═══════════════════════════════════════════════════
//  TICKET TYPE SERVICE
// ═══════════════════════════════════════════════════
export const ticketTypeService = {
    getAll: (params?: { search?: string; category?: string }) =>
        axiosClient.get('/ticket-types', { params }),

    getById: (id: number) =>
        axiosClient.get(`/ticket-types/${id}`),

    getStats: () =>
        axiosClient.get('/ticket-types/stats'),

    getCategories: () =>
        axiosClient.get('/ticket-types/categories'),

    getDiscountTypes: () =>
        axiosClient.get('/ticket-types/discount-types'),

    create: (data: {
        Name: string; Description?: string;
        Duration_Day: number; requiresFace: boolean;
        Id_Category: number; id_discount_type?: number | null;
        defaultPrice?: number | null;
        is_active?: boolean;
    }) =>
        axiosClient.post('/ticket-types', data),

    update: (id: number, data: Partial<{
        Name: string; Description: string;
        Duration_Day: number; requiresFace: boolean;
        Id_Category: number; id_discount_type: number | null;
        defaultPrice: number | null;
        is_active: boolean;
    }>) =>
        axiosClient.put(`/ticket-types/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/ticket-types/${id}`),
};

// ═══════════════════════════════════════════════════
//  TICKET & ORDER SERVICE
// ═══════════════════════════════════════════════════
export const ticketService = {
    getAllOrders: (params?: { search?: string; status?: string }) =>
        axiosClient.get('/tickets/admin/all', { params }),

    getOrderDetail: (id: string) =>
        axiosClient.get(`/tickets/detail/${id}`),

    updateOrderStatus: (id: string, status: string) =>
        axiosClient.patch(`/tickets/order/${id}/status`, { status }),

    updateTicketStatus: (id: string, status: string) =>
        axiosClient.patch(`/tickets/item/${id}/status`, { status }),

    getStats: () =>
        axiosClient.get('/tickets/admin/stats'),

    getTicketStats: () =>
        axiosClient.get('/tickets/admin/stats'),

    getFullStats: (params?: { range?: string; start?: string; end?: string }) =>
        axiosClient.get('/tickets/admin/full-stats', { params }),

    purchase: (data: {
        Id_Ticket_Type: number;
        Id_User: string;
        Quantity: number;
        price: number;
        From_Location?: number | null;
        To_Location?: number | null;
        id_payment?: number;
    }) =>
        axiosClient.post('/tickets/purchase', data),

    deleteOrder: (id: string) =>
        axiosClient.delete(`/tickets/order/${id}`),
};


// ═══════════════════════════════════════════════════
//  TICKET PRICE SERVICE
// ═══════════════════════════════════════════════════
export const ticketPriceService = {
    getAll: (params?: { search?: string }) =>
        axiosClient.get('/ticket-prices', { params }),

    getById: (id: number) =>
        axiosClient.get(`/ticket-prices/${id}`),

    getStats: () =>
        axiosClient.get('/ticket-prices/stats'),

    getTypes: () =>
        axiosClient.get('/ticket-prices/types'),

    create: (data: { Id_Ticket_Type: number; Price: number; From_Location_Id?: number | null; To_Location_Id?: number | null; is_active?: boolean }) =>
        axiosClient.post('/ticket-prices', data),

    update: (id: number, data: { Price?: number; Id_Ticket_Type?: number; From_Location_Id?: number | null; To_Location_Id?: number | null; is_active?: boolean }) =>
        axiosClient.put(`/ticket-prices/${id}`, data),

    bulkUpsert: (items: { Id_Ticket_Type: number; Price: number; From_Location_Id?: number | null; To_Location_Id?: number | null }[]) =>
        axiosClient.post('/ticket-prices/bulk-upsert', { items }),

    delete: (id: number) =>
        axiosClient.delete(`/ticket-prices/${id}`),
};

// ═══════════════════════════════════════════════════
//  TICKET CATEGORY SERVICE
// ═══════════════════════════════════════════════════
export const ticketCategoryService = {
    getAll: (params?: { search?: string }) =>
        axiosClient.get('/ticket-categories', { params }),

    getById: (id: number) =>
        axiosClient.get(`/ticket-categories/${id}`),

    getStats: () =>
        axiosClient.get('/ticket-categories/stats'),

    create: (data: { 
        code: string; 
        name: string; 
        description?: string; 
        sort_order?: number;
        requires_route?: boolean;
        requires_kyc_default?: boolean;
        is_active?: boolean;
    }) =>
        axiosClient.post('/ticket-categories', data),

    update: (id: number, data: { 
        name?: string; 
        description?: string; 
        sort_order?: number;
        requires_route?: boolean;
        requires_kyc_default?: boolean;
        is_active?: boolean;
    }) =>
        axiosClient.put(`/ticket-categories/${id}`, data),

    reorder: (items: { Id: number; sort_order: number }[]) =>
        axiosClient.post('/ticket-categories/reorder', { items }),

    delete: (id: number) =>
        axiosClient.delete(`/ticket-categories/${id}`),
};

// ═══════════════════════════════════════════════════
//  PROMOTION SERVICE
// ═══════════════════════════════════════════════════
export const promotionService = {
    getAll: (params?: { search?: string; status?: string }) =>
        axiosClient.get('/promotions', { params }),

    getById: (code: string) =>
        axiosClient.get(`/promotions/${code}`),

    getStats: () =>
        axiosClient.get('/promotions/stats'),

    create: (data: Record<string, any>) =>
        axiosClient.post('/promotions', data),

    update: (code: string, data: Record<string, any>) =>
        axiosClient.put(`/promotions/${code}`, data),

    delete: (code: string) =>
        axiosClient.delete(`/promotions/${code}`),

    uploadBanner: (formData: FormData) =>
        axiosClient.post('/upload/promotion-banner', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
};

// ═══════════════════════════════════════════════════
//  DISCOUNT REGISTRATION SERVICE
// ═══════════════════════════════════════════════════
export const discountRegistrationService = {
    getAll: (params?: { status?: string; search?: string }) =>
        axiosClient.get('/discount-registrations/admin/all', { params }),

    getById: (id: number) =>
        axiosClient.get(`/discount-registrations/admin/${id}`),

    updateStatus: (id: number, data: { status: string; expiry_date?: any; rejected_reason?: string; approved_by?: string; PromotionCode?: string }) =>
        axiosClient.put(`/discount-registrations/admin/${id}/status`, data),

    delete: (id: number) =>
        axiosClient.delete(`/discount-registrations/admin/${id}`),

    // Config: Form Builder
    getFullConfig: () => axiosClient.get('/discount-registrations/admin/config/all'),
    saveType: (data: any) => axiosClient.post('/discount-registrations/admin/config/type', data),
    deleteType: (id: number) => axiosClient.delete(`/discount-registrations/admin/config/type/${id}`),
    syncFields: (data: any) => axiosClient.post('/discount-registrations/admin/config/sync-fields', data),
};

// ═══════════════════════════════════════════════════
//  TICKET LOG SERVICE
// ═══════════════════════════════════════════════════
export const ticketLogService = {
    getAll: (params?: {
        location_id?: number;
        status?: string;
        scan_direction?: string;
        date_from?: string;
        date_to?: string;
        page?: number;
        limit?: number;
    }) => axiosClient.get('/ticket-logs/admin/all', { params }),

    getStats: (params?: { date_from?: string; date_to?: string }) =>
        axiosClient.get('/ticket-logs/admin/stats', { params }),

    getByTicket: (ticketId: string) =>
        axiosClient.get(`/ticket-logs/ticket/${ticketId}`),
};

// ═══════════════════════════════════════════════════
//  PAYMENT SERVICE
// ═══════════════════════════════════════════════════
export const paymentService = {
    getAll: (params?: { search?: string }) => 
        axiosClient.get('/payments', { params }),

    getStats: () => 
        axiosClient.get('/payments/stats'),
        
    getById: (id: number) => 
        axiosClient.get(`/payments/${id}`),
};

// ═══════════════════════════════════════════════════
//  PAYMENT METHOD SERVICE
// ═══════════════════════════════════════════════════
export const paymentMethodService = {
    getAll: () => axiosClient.get('/payment-methods'),
    getById: (id: number) => axiosClient.get(`/payment-methods/${id}`),
    create: (data: any) => axiosClient.post('/payment-methods', data),
    update: (id: number, data: any) => axiosClient.put(`/payment-methods/${id}`, data),
    delete: (id: number) => axiosClient.delete(`/payment-methods/${id}`),
};
