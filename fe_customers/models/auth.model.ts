export interface UserMobile {
    id: string;
    name: string;
    email?: string;
    phone: string;
    cccd_number: string;
    avatar?: string;
    birthday?: string;
    sex?: string;
    issue_date?: string;
    address?: string;
    is_face_registered: boolean;
}

export interface AuthMobileResponse {
    success: boolean;
    message: string;
    token?: string;
    data?: any;
}
