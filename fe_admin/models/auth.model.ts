export interface UserNode {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    birthday: string;
    sex: string;
    cccd_number: string;
    avatar: string | null;
    is_face_registered: boolean;
    role?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    data?: any;
}
