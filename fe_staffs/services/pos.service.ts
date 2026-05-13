import { axiosClient } from '../api_client/axiosClient';

export interface Location {
    Id: number;
    id?: number;
    Name: string;
    Order?: number;
    order_index?: number;
}

export interface TicketType {
    Id: number;
    Id_Category: number;
    Name: string;
    Duration_Day: number;
    requiresFace: boolean;
}

export interface TicketPrice {
    Id: number;
    Price: number | string;
    From_Location_Id: number;
    To_Location_Id: number;
}

export const posService = {
    getLocations: async (): Promise<{ success: boolean; data: Location[] }> => {
        return await axiosClient.get('/locations');
    },

    getTicketTypes: async (): Promise<{ success: boolean; data: TicketType[] }> => {
        return await axiosClient.get('/ticket-types');
    },

    getTicketPrices: async (ticketTypeId: number): Promise<{ success: boolean; data: TicketPrice[] }> => {
        return await axiosClient.get(`/ticket-prices?Id_Ticket_Type=${ticketTypeId}`);
    },

    purchaseTicket: async (payload: any): Promise<{ success: boolean; message: string; data: any }> => {
        return await axiosClient.post('/tickets/purchase', payload);
    },

    purchaseTimeTicket: async (payload: any): Promise<{ success: boolean; message: string; data: any }> => {
        return await axiosClient.post('/tickets/purchase-time', payload);
    },

    getUsers: async (): Promise<{ success: boolean; data: any[] }> => {
        return await axiosClient.get('/users');
    },

    getPaymentMethods: async (): Promise<{ success: boolean; data: any[] }> => {
        return await axiosClient.get('/payment-methods');
    },

    scanCCCD: async (formData: FormData): Promise<{ success: boolean; message: string; data: any }> => {
        return await axiosClient.post('/upload/cccd-qr', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000 // Tăng timeout lên 30s vì OCR có thể xử lý nhiều ảnh
        });
    },

    getUserByCCCD: async (cccd: string): Promise<{ success: boolean; message: string; data: any }> => {
        return await axiosClient.get(`/users/by-cccd/${cccd}`);
    },
    
    getPromotionByCode: async (code: string): Promise<{ success: boolean; data: any; message?: string }> => {
        return await axiosClient.get(`/promotions/${code}`);
    },

    getPromotions: async (): Promise<{ success: boolean; data: any[] }> => {
        return await axiosClient.get('/promotions');
    }
};
