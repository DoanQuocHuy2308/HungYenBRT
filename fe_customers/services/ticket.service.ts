import { axiosClient } from '../api_client/axiosClient';

export interface Location {
    Id: number;
    Name: string;
    Order?: number;
}

export interface TicketType {
    Id: number;
    Id_Category: number;
    Name: string;
    Duration_Day: number;
}

export interface TicketPrice {
    Id: number;
    Price: number | string;
    From_Location_Id: number | null;
    To_Location_Id: number | null;
}

export const ticketService = {
    getLocations: async (): Promise<{ success: boolean; data: Location[] }> => {
        return await axiosClient.get('/locations') as any;
    },

    getTicketTypes: async (): Promise<{ success: boolean; data: TicketType[] }> => {
        return await axiosClient.get('/ticket-types') as any;
    },

    getTicketPrices: async (ticketTypeId: number): Promise<{ success: boolean; data: TicketPrice[] }> => {
        return await axiosClient.get(`/ticket-prices?Id_Ticket_Type=${ticketTypeId}`) as any;
    },

    purchaseTicket: async (payload: any): Promise<{ success: boolean; message: string; data: any }> => {
        return await axiosClient.post('/tickets/purchase', payload) as any;
    },

    purchaseTimeTicket: async (payload: any): Promise<{ success: boolean; message: string; data: any }> => {
        return await axiosClient.post('/tickets/purchase-time', payload) as any;
    },

    getMyOrders: async (userId: string | number): Promise<{ success: boolean; data: any[] }> => {
        return await axiosClient.get(`/tickets/my/${userId}`) as any;
    }
};
