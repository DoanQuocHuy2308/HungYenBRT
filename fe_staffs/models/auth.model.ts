export interface StaffNode {
    id: string;
    username: string;
    name: string;
    email: string | null;
    phone: string;
    role?: string;
}

export interface AuthStaffResponse {
    success: boolean;
    message: string;
    token?: string;
    data?: any;
}
